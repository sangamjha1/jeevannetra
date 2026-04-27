import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { Role, User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';
import { Bill } from '../bills/entities/bill.entity';
import { MedicalHistory } from '../patients/entities/medical-history.entity';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');
  private transporter?: nodemailer.Transporter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(MedicalHistory)
    private medicalHistoryRepository: Repository<MedicalHistory>,
  ) {
    // Initialize SMTP transporter
    if (process.env.SMTP_HOST && process.env.SMTP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: true, // true for port 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      this.logger.log(`✅ SMTP transporter initialized: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    } else {
      this.logger.warn(`⚠️ SMTP not configured - missing SMTP_HOST or SMTP_PASSWORD`);
    }
  }

  async signup(data: any): Promise<User> {
    // Check if email already exists (one email = one profile rule)
    const userRole = data.role || Role.PATIENT;
    const existingUser = await this.usersService.findByEmail(data.email);
    
    // If user exists and email is NOT verified, they must verify first
    if (existingUser && !existingUser.isEmailVerified) {
      throw new UnauthorizedException('Email has not been verified yet. Please verify your email first.');
    }

    // If user exists but password is not 'temp' (i.e., actual user account), reject
    if (existingUser && existingUser.password !== 'temp' && existingUser.isEmailVerified) {
      throw new ConflictException(`This email is already registered. One email can only create one profile.`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Parse date if provided
    const dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : undefined;
    
    let user: User;

    if (existingUser && existingUser.password === 'temp' && existingUser.isEmailVerified) {
      // Update existing temporary user with actual signup data
      this.logger.log(`🔄 Converting temporary user to full user: ${data.email}`);
      user = await this.usersService.update(existingUser.id, {
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        address: data.address || null,
        gender: data.gender || null,
        dateOfBirth: dateOfBirth,
      });
    } else {
      // Create new user
      user = await this.usersService.create({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        role: userRole,
        address: data.address || null,
        gender: data.gender || null,
        dateOfBirth: dateOfBirth,
        isEmailVerified: true,
      });
    }

    // Create patient profile if registering as patient with medical data
    if (userRole === Role.PATIENT) {
      try {
        const existingProfile = await this.patientRepository.findOne({ where: { userId: user.id } });
        if (!existingProfile) {
          const patientData = {
            userId: user.id,
            bloodGroup: data.bloodGroup || null,
            height: data.height ? parseFloat(data.height) : null,
            weight: data.weight ? parseFloat(data.weight) : null,
            emergencyContact: data.emergencyContact || null,
          } as any;
          const savedPatient = await this.patientRepository.save(
            this.patientRepository.create(patientData)
          );
          this.logger.log(`✅ Patient profile created for user: ${user.id}`);
        }
      } catch (error) {
        this.logger.error(`❌ Failed to create patient profile for ${user.id}:`, error);
        throw new Error('Failed to create patient profile. Please contact support.');
      }
    }

    this.logger.log(`✅ User registered successfully: ${data.email} with role ${userRole}`);
    return user;
  }

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    await this.usersService.setRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException();
      }

      const newPayload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_SECRET,
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async logout(userId: string) {
    return this.usersService.setRefreshToken(userId, null);
  }

  async forgotPassword(email: string) {
    this.logger.log(`🔍 Checking if user exists: ${email}`);
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      this.logger.warn(`⚠️ Forgot password request for non-existent email: ${email}`);
      return { success: true, message: 'If an account exists with this email, a reset code has been sent.' };
    }

    this.logger.log(`✅ User found: ${email} - generating reset code`);

    // Generate random 6-character reset code
    const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Set expiry to 15 minutes from now
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);

    // Save to database
    await this.usersService.update(user.id, {
      passwordResetCode: resetCode,
      passwordResetCodeExpiry: expiryTime,
    } as any);
    this.logger.log(`💾 Reset code saved to DB for ${email}. Code: ${resetCode}, Expires: ${expiryTime}`);

    // Send email via SMTP
    try {
      if (this.transporter && process.env.SMTP_FROM_EMAIL) {
        this.logger.log(`📧 Attempting to send email to: ${email}`);
        const result = await this.transporter.sendMail({
          from: `JeevanNetra HMS <${process.env.SMTP_FROM_EMAIL}>`,
          to: email,
          subject: 'Password Reset Code - JeevanNetra HMS',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #333; margin: 0;">JeevanNetra HMS</h1>
                <p style="color: #666; margin: 5px 0 0 0;">Healthcare Management System</p>
              </div>
              
              <div style="background: #f9f9f9; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
                <p>Hello ${user.firstName || 'User'},</p>
                <p>We received a request to reset your password. Use the code below to proceed:</p>
                
                <div style="background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
                  <p style="margin: 0; font-size: 12px; opacity: 0.9;">Your Reset Code</p>
                  <h1 style="margin: 10px 0 0 0; font-size: 42px; letter-spacing: 3px;">${resetCode}</h1>
                </div>
                
                <p style="color: #666; font-size: 14px;">This code will expire in <strong>15 minutes</strong>.</p>
                <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn't request a password reset, please ignore this email. Your account will remain secure.</p>
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © 2026 JeevanNetra HMS. All rights reserved.<br>
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </div>
          `,
        });
        this.logger.log(`✅ Email sent successfully to ${email}. Message ID: ${result.messageId}`);
      } else {
        this.logger.warn(`⚠️  Email NOT sent - transporter: ${!!this.transporter}, fromEmail: ${process.env.SMTP_FROM_EMAIL}`);
        this.logger.log(`\n⚠️  FALLBACK: Reset code for ${email}:`);
        this.logger.log(`   Code: ${resetCode}`);
        this.logger.log(`   Expires in: 15 minutes\n`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${email}:`, error);
      this.logger.log(`\n⚠️  FALLBACK: Reset code for ${email}:`);
      this.logger.log(`   Code: ${resetCode}`);
      this.logger.log(`   Expires in: 15 minutes\n`);
    }

    return { success: true, message: 'If an account exists with this email, a reset code has been sent.' };
  }

  async verifyResetCode(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if code matches and hasn't expired
    if (!user.passwordResetCode || user.passwordResetCode !== code.toUpperCase()) {
      throw new UnauthorizedException('Invalid reset code');
    }

    if (!user.passwordResetCodeExpiry || new Date() > user.passwordResetCodeExpiry) {
      throw new UnauthorizedException('Reset code has expired. Request a new one.');
    }

    return { success: true, message: 'Reset code verified. You can now set a new password.' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify code is valid and not expired
    if (!user.passwordResetCode || user.passwordResetCode !== code.toUpperCase()) {
      throw new UnauthorizedException('Invalid reset code');
    }

    if (!user.passwordResetCodeExpiry || new Date() > user.passwordResetCodeExpiry) {
      throw new UnauthorizedException('Reset code has expired. Request a new one.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset code
    await this.usersService.update(user.id, {
      password: hashedPassword,
      passwordResetCode: null,
      passwordResetCodeExpiry: null,
    } as any);

    this.logger.log(`✅ Password reset successful for ${email}`);

    return { success: true, message: 'Password has been reset successfully. You can now login with your new password.' };
  }

  async sendVerificationEmail(email: string, role?: string) {
    const userRole = role || Role.PATIENT;
    this.logger.log(`🔍 Checking if email already in use: ${email}`);
    
    // Check if email already exists (regardless of role)
    let user = await this.usersService.findByEmail(email);
    
    if (user && user.isEmailVerified) {
      throw new ConflictException(`This email is already registered. One email can only create one profile.`);
    }

    // If user doesn't exist, create a minimal unverified user record
    if (!user) {
      this.logger.log(`📝 Creating temporary user record for verification: ${email} (${userRole})`);
      user = await this.usersService.create({
        email: email,
        password: 'temp', // Temporary password, will be set during signup
        role: userRole as Role,
        isEmailVerified: false,
      });
    }

    this.logger.log(`✅ Sending verification code to: ${email}`);

    // Generate random 6-character verification code
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Set expiry to 15 minutes from now
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);

    // Update verification code
    await this.usersService.update(user.id, {
      emailVerificationCode: verificationCode,
      emailVerificationCodeExpiry: expiryTime,
    } as any);
    this.logger.log(`💾 Verification code saved for: ${email}`);

    // Send email via SMTP
    try {
      if (this.transporter && process.env.SMTP_FROM_EMAIL) {
        this.logger.log(`📧 Attempting to send verification email to: ${email}`);
        const result = await this.transporter.sendMail({
          from: `JeevanNetra HMS <${process.env.SMTP_FROM_EMAIL}>`,
          to: email,
          subject: 'Email Verification Code - JeevanNetra HMS',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #333; margin: 0;">JeevanNetra HMS</h1>
                <p style="color: #666; margin: 5px 0 0 0;">Healthcare Management System</p>
              </div>
              
              <div style="background: #f9f9f9; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
                <p>Welcome to JeevanNetra HMS!</p>
                <p>To complete your registration, please verify your email address using the code below:</p>
                
                <div style="background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
                  <p style="margin: 0; font-size: 12px; opacity: 0.9;">Your Verification Code</p>
                  <h1 style="margin: 10px 0 0 0; font-size: 42px; letter-spacing: 3px;">${verificationCode}</h1>
                </div>
                
                <p style="color: #666; font-size: 14px;">This code will expire in <strong>15 minutes</strong>.</p>
                <p style="color: #666; font-size: 14px; margin-top: 20px;">Do not share this code with anyone. JeevanNetra staff will never ask for this code.</p>
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © 2026 JeevanNetra HMS. All rights reserved.<br>
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </div>
          `,
        });
        this.logger.log(`✅ Verification email sent successfully to ${email}. Message ID: ${result.messageId}`);
      } else {
        this.logger.warn(`⚠️  Email NOT sent - transporter: ${!!this.transporter}, fromEmail: ${process.env.SMTP_FROM_EMAIL}`);
        this.logger.log(`\n⚠️  FALLBACK: Verification code for ${email}:`);
        this.logger.log(`   Code: ${verificationCode}`);
        this.logger.log(`   Expires in: 15 minutes\n`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to send verification email to ${email}:`, error);
      this.logger.log(`\n⚠️  FALLBACK: Verification code for ${email}:`);
      this.logger.log(`   Code: ${verificationCode}`);
      this.logger.log(`   Expires in: 15 minutes\n`);
    }

    return { success: true, message: 'Verification code sent to your email.' };
  }

  async verifyEmailCode(email: string, code: string, role?: string) {
    const userRole = role || Role.PATIENT;
    this.logger.log(`🔍 Verifying email code for: ${email}`);
    
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`⚠️ Verification attempted for non-existent user: ${email}`);
      throw new UnauthorizedException('Email not found. Please register first.');
    }

    // Check if code matches and hasn't expired
    if (!user.emailVerificationCode || user.emailVerificationCode !== code.toUpperCase()) {
      this.logger.warn(`⚠️ Invalid verification code for ${email}`);
      throw new UnauthorizedException('Invalid verification code');
    }

    if (!user.emailVerificationCodeExpiry || new Date() > user.emailVerificationCodeExpiry) {
      this.logger.warn(`⚠️ Verification code expired for ${email}`);
      throw new UnauthorizedException('Verification code has expired. Request a new one.');
    }

    // Mark email as verified and clear verification code
    await this.usersService.update(user.id, {
      isEmailVerified: true,
      emailVerificationCode: null,
      emailVerificationCodeExpiry: null,
    } as any);

    this.logger.log(`✅ Email verified successfully for ${email}`);

    return { success: true, message: 'Email verified successfully. You can now complete your registration.' };
  }

  async deleteAccount(userId: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`🗑️ Attempting to delete account for user: ${userId}`);
    
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    try {
      // Delete patient profile if patient role
      if (user.role === Role.PATIENT) {
        // Get patient ID first
        const patient = await this.patientRepository.findOne({ where: { userId } });
        if (patient) {
          this.logger.log(`🗑️ Deleting related data for patient: ${patient.id}`);

          // Delete all related data first (respect foreign key constraints)
          // 1. Delete prescriptions
          await this.prescriptionRepository.delete({ patientId: patient.id });
          this.logger.log(`✅ Deleted prescriptions for patient: ${patient.id}`);

          // 2. Delete medical history
          await this.medicalHistoryRepository.delete({ patientId: patient.id });
          this.logger.log(`✅ Deleted medical history for patient: ${patient.id}`);

          // 3. Delete bills
          await this.billRepository.delete({ patientId: patient.id });
          this.logger.log(`✅ Deleted bills for patient: ${patient.id}`);

          // 4. Delete appointments
          await this.appointmentRepository.delete({ patientId: patient.id });
          this.logger.log(`✅ Deleted appointments for patient: ${patient.id}`);

          // 5. Finally, delete patient profile
          await this.patientRepository.delete({ userId });
          this.logger.log(`✅ Deleted patient profile for user: ${userId}`);
        }
      }

      // Delete user account
      const deleted = await this.usersService.delete(userId);
      if (!deleted) {
        throw new Error('Failed to delete user');
      }

      this.logger.log(`✅ User account deleted successfully: ${user.email} (${user.role})`);
      return {
        success: true,
        message: 'Your account has been permanently deleted. All your data has been removed from our system.',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to delete account for ${userId}:`, error);
      throw new Error('Failed to delete account. Please contact support.');
    }
  }
}
