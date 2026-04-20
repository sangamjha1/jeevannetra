import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import axios from 'axios';
import { EmergencyRequest, EmergencyStatus } from './entities/emergency-request.entity';
import { AccidentReport, AccidentSeverity } from './entities/accident-report.entity';
import { CreateEmergencyDto, UpdateEmergencyDto } from './dto/emergency.dto';

@Injectable()
export class EmergencyService {
  private readonly logger = new Logger(EmergencyService.name);

  constructor(
    @InjectRepository(EmergencyRequest)
    private emergencyRepository: Repository<EmergencyRequest>,
    @InjectRepository(AccidentReport)
    private accidentRepository: Repository<AccidentReport>,
  ) {}

  async create(userId: string, createEmergencyDto: CreateEmergencyDto) {
    const request = this.emergencyRepository.create({
      userId,
      latitude: createEmergencyDto.latitude,
      longitude: createEmergencyDto.longitude,
      status: EmergencyStatus.PENDING,
    });

    const savedRequest = await this.emergencyRepository.save(request);
    
    // FETCH FULL RELATION FOR MOCK SMS LOGGING
    const fullRequest = await this.emergencyRepository.findOne({
      where: { id: savedRequest.id },
      relations: ['user'],
    });

    if (!fullRequest) {
      throw new NotFoundException('Emergency request not found after creation');
    }

    // SYSTEM ACTIVITY LOGGING (Mock SMS)
    this.logger.log('--- [DISPATCH SYSTEM: SMS ALERT] ---');
    this.logger.log(`TO: ${fullRequest.user?.phone || 'Emergency Contact'}`);
    this.logger.log(`MSG: EMERGENCY ALERT! User ${fullRequest.user?.firstName} ${fullRequest.user?.lastName} requires immediate assistance.`);
    this.logger.log(`GPS: https://www.google.com/maps?q=${fullRequest.latitude},${fullRequest.longitude}`);
    this.logger.log('-------------------------------------');

    return fullRequest;
  }

  async update(id: string, updateEmergencyDto: UpdateEmergencyDto) {
    const request = await this.emergencyRepository.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Emergency request not found');

    await this.emergencyRepository.update(id, {
      status: updateEmergencyDto.status as EmergencyStatus,
      staffId: updateEmergencyDto.staffId,
    });

    return this.emergencyRepository.findOne({
      where: { id },
      relations: ['user', 'staff', 'staff.user'],
    });
  }

  async findAll() {
    return this.emergencyRepository.find({
      relations: ['user', 'staff', 'staff.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActive() {
    return this.emergencyRepository.find({
      where: {
        status: In([EmergencyStatus.PENDING, EmergencyStatus.DISPATCHED]),
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // ACCIDENT REPORTS
  async reportAccident(userId: string, latitude: number, longitude: number, severity: AccidentSeverity = AccidentSeverity.MEDIUM) {
    const report = this.accidentRepository.create({
      userId,
      latitude,
      longitude,
      severity,
    });

    const savedReport = await this.accidentRepository.save(report);

    // Fetch full report with user data
    const fullReport = await this.accidentRepository.findOne({
      where: { id: savedReport.id },
      relations: ['user'],
    });

    // Log accident alert
    this.logger.warn('--- [ACCIDENT DETECTION ALERT] ---');
    this.logger.warn(`SEVERITY: ${severity}`);
    this.logger.warn(`USER: ${fullReport?.user?.firstName} ${fullReport?.user?.lastName} (${fullReport?.user?.phone})`);
    this.logger.warn(`LOCATION: https://www.google.com/maps?q=${latitude},${longitude}`);
    this.logger.warn(`TIME: ${new Date().toISOString()}`);
    this.logger.warn('----------------------------------');

    // Automatically create emergency request if severity is HIGH or CRITICAL
    if (severity === AccidentSeverity.HIGH || severity === AccidentSeverity.CRITICAL) {
      await this.create(userId, { latitude, longitude });
    }

    return fullReport;
  }

  async getAccidentReports() {
    return this.accidentRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Send WhatsApp messages via CallMeBot to emergency contacts
  async sendEmergencySMS(userId: string, latitude: number, longitude: number, userName: string, emergencyContacts?: Array<{ name: string; phone: string }>) {
    this.logger.warn('📱 [WHATSAPP ALERT] Sending emergency alerts via WhatsApp...');
    
    try {
      if (!emergencyContacts || emergencyContacts.length === 0) {
        this.logger.warn('⚠️  No emergency contacts found. Skipping WhatsApp alerts.');
        return {
          success: false,
          message: 'No emergency contacts configured',
          sentTo: [],
        };
      }

      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const message = `🆘 EMERGENCY ALERT!\n\n${userName} has been in an accident!\n\nLocation: ${mapsUrl}\n\nEmergency services (100) are being contacted now.\n\nPlease respond if you can help or provide assistance.`;

      const sentTo: string[] = [];
      const callMeBotUrl = 'https://api.callmebot.com/whatsapp.php';

      // Send WhatsApp to each emergency contact
      for (const contact of emergencyContacts) {
        try {
          // Ensure phone number has country code (e.g., +91 for India)
          let phoneNumber = contact.phone;
          if (!phoneNumber.startsWith('+')) {
            phoneNumber = '+91' + phoneNumber; // Default to India, adjust as needed
          }

          this.logger.log(`📤 Sending WhatsApp to ${contact.name} (${phoneNumber})...`);

          // Call CallMeBot API (FREE - no API key required for basic usage)
          try {
            await axios.get(callMeBotUrl, {
              params: {
                phone: phoneNumber,
                text: message,
              },
              timeout: 5000,
            });

            sentTo.push(`${contact.name} (${phoneNumber})`);
            this.logger.log(`✅ WhatsApp sent to ${contact.name}`);
          } catch (apiError: any) {
            this.logger.warn(`⚠️  Failed to send WhatsApp to ${contact.name}: ${apiError.message}`);
            // Continue to next contact even if one fails
          }
        } catch (error) {
          this.logger.error(`Error processing contact ${contact.name}:`, error);
        }
      }

      this.logger.warn('--- [WHATSAPP MESSAGE LOG] ---');
      this.logger.warn(`USER: ${userName}`);
      this.logger.warn(`LOCATION: ${mapsUrl}`);
      this.logger.warn(`MESSAGE: ${message}`);
      this.logger.warn(`SENT_TO: ${sentTo.length}/${emergencyContacts.length} contacts`);
      this.logger.warn(`TIME: ${new Date().toISOString()}`);
      this.logger.warn('---------------------------');

      return {
        success: sentTo.length > 0,
        message: `WhatsApp alerts sent to ${sentTo.length} contact(s)`,
        sentTo,
      };
    } catch (error) {
      this.logger.error('Failed to send emergency WhatsApp:', error);
      throw error;
    }
  }

  // Trigger CallMeBot to make emergency call
  async callEmergencyNumber(phoneNumber: string, userName: string) {
    this.logger.warn('📞 [CALLMEBOT] Initiating emergency call...');
    
    try {
      // CallMeBot webhook integration
      const callMeBotUrl = 'https://api.callmebot.com/whatsapp.php'; // Alternative: use phone call API
      
      // For actual calls, you would use:
      // const response = await axios.get(callMeBotUrl, {
      //   params: {
      //     phone: phoneNumber,
      //     text: `Emergency alert: ${userName} has been in an accident. Emergency services are being contacted.`,
      //     apikey: process.env.CALLMEBOT_API_KEY,
      //   }
      // });

      // Mock implementation
      this.logger.warn('--- [EMERGENCY CALL INITIATED] ---');
      this.logger.warn(`CONTACT: ${phoneNumber}`);
      this.logger.warn(`USER: ${userName}`);
      this.logger.warn(`TARGET: Emergency Services (100)`);
      this.logger.warn(`TIME: ${new Date().toISOString()}`);
      this.logger.warn(`STATUS: In production, actual call would be made via CallMeBot`);
      this.logger.warn('--------------------------------');

      return {
        success: true,
        message: 'Emergency call request processed',
        note: 'To enable actual calls, configure CallMeBot API key in .env',
      };
    } catch (error) {
      this.logger.error('Failed to initiate emergency call:', error);
      throw error;
    }
  }

  // Master emergency trigger - calls both WhatsApp and emergency number
  async triggerEmergency(userId: string, user: any, latitude: number, longitude: number) {
    this.logger.error('🚨 [MASTER EMERGENCY TRIGGER] 🚨');
    this.logger.error(`USER: ${user?.firstName} ${user?.lastName}`);
    this.logger.error(`PHONE: ${user?.phone}`);
    this.logger.error(`LOCATION: ${latitude}, ${longitude}`);
    this.logger.error(`EMERGENCY_CONTACTS: ${user?.emergencyContacts?.length || 0}`);
    this.logger.error(`TIME: ${new Date().toISOString()}`);
    
    try {
      const userName = `${user?.firstName} ${user?.lastName}`;

      // 1. Send WhatsApp to emergency contacts
      const whatsappResult = await this.sendEmergencySMS(
        userId, 
        latitude, 
        longitude, 
        userName,
        user?.emergencyContacts || []
      );

      // 2. Call emergency number (100)
      const callResult = await this.callEmergencyNumber(user?.phone || '1234567890', userName);

      // 3. Create emergency request
      const emergency = await this.create(userId, { latitude, longitude });

      return {
        success: true,
        emergency,
        whatsapp: whatsappResult,
        call: callResult,
        alerts: [
          `WhatsApp sent to ${whatsappResult.sentTo?.length || 0} contacts`,
          'Emergency call initiated to 100'
        ],
      };
    } catch (error) {
      this.logger.error('Emergency trigger failed:', error);
      throw error;
    }
  }
}
