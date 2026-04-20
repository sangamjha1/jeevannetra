import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { StaffService } from './staff/staff.service';
import { HospitalsService } from './hospitals/hospitals.service';
import { Role } from './users/entities/user.entity';
import { Staff, StaffType } from './staff/entities/staff.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const hospitalsService = app.get(HospitalsService);
  const staffService = app.get(StaffService);
  const staffRepository = app.get<Repository<Staff>>(getRepositoryToken(Staff));

  console.log('--- POPULATING DIVERSE STAFF ---');

  // Get first hospital
  const hospitals = await hospitalsService.findAll();
  if (hospitals.length === 0) {
    console.error('No hospital found!');
    process.exit(1);
  }

  const hospital = hospitals[0];
  console.log(`Using hospital: ${hospital.id}`);

  // Define staff to create with diverse types
  const staffData = [
    { email: 'icu.staff@hospital.com', firstName: 'Raj', lastName: 'Kumar', type: StaffType.ICU_STAFF, phone: '+1 555-0301' },
    { email: 'ot.staff@hospital.com', firstName: 'Priya', lastName: 'Singh', type: StaffType.OT_STAFF, phone: '+1 555-0302' },
    { email: 'opd.staff@hospital.com', firstName: 'Amit', lastName: 'Patel', type: StaffType.OPD_STAFF, phone: '+1 555-0303' },
    { email: 'surgeon@hospital.com', firstName: 'Dr. Vikram', lastName: 'Verma', type: StaffType.SURGEON, phone: '+1 555-0304' },
    { email: 'anesthetist@hospital.com', firstName: 'Dr. Neha', lastName: 'Sharma', type: StaffType.ANESTHETIST, phone: '+1 555-0305' },
    { email: 'physio@hospital.com', firstName: 'Ravi', lastName: 'Desai', type: StaffType.PHYSIOTHERAPIST, phone: '+1 555-0306' },
    { email: 'lab.tech@hospital.com', firstName: 'Kavya', lastName: 'Nair', type: StaffType.LAB_TECHNICIAN, phone: '+1 555-0307' },
    { email: 'receptionist@hospital.com', firstName: 'Anjali', lastName: 'Gupta', type: StaffType.RECEPTIONIST, phone: '+1 555-0308' },
    { email: 'ambulance@hospital.com', firstName: 'Suresh', lastName: 'Rao', type: StaffType.AMBULANCE_DRIVER, phone: '+1 555-0309' },
    { email: 'ward.boy@hospital.com', firstName: 'Ramesh', lastName: 'Singh', type: StaffType.WARD_BOY, phone: '+1 555-0310' },
    { email: 'security@hospital.com', firstName: 'Harish', lastName: 'Joshi', type: StaffType.SECURITY, phone: '+1 555-0311' },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const data of staffData) {
    try {
      // Check if user already exists
      let user = await usersService.findByEmail(data.email).catch(() => null);

      if (!user) {
        // Create user
        const hashedPassword = await bcrypt.hash('staff123', 10);
        user = await usersService.create({
          email: data.email,
          password: hashedPassword,
          role: Role.STAFF,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          onboardingDone: true,
        });
        console.log(`✓ User created: ${data.email}`);
      } else {
        console.log(`⊘ User already exists: ${data.email}`);
      }

      // Check if staff profile already exists
      const existingStaff = await staffRepository.findOne({
        where: { userId: user.id },
      });

      if (!existingStaff) {
        // Create staff profile
        await staffRepository.save({
          userId: user.id,
          hospitalId: hospital.id,
          type: data.type,
          tasks: { shift: 'Day' },
        });
        console.log(`  ✓ Staff profile created: ${data.firstName} ${data.lastName} (${data.type})`);
        createdCount++;
      } else {
        console.log(`  ⊘ Staff profile already exists: ${data.firstName} ${data.lastName}`);
        skippedCount++;
      }
    } catch (err: any) {
      console.error(`✗ Error creating staff ${data.email}:`, err.message);
    }
  }

  console.log(`\n--- SUMMARY ---`);
  console.log(`✓ Created: ${createdCount} staff profiles`);
  console.log(`⊘ Skipped: ${skippedCount} (already exist)`);

  // Show summary
  const allStaff = await staffRepository.find({
    where: { hospitalId: hospital.id },
    relations: ['user'],
  });

  console.log(`\n--- STAFF BY TYPE ---`);
  const typeMap = new Map<string, number>();
  allStaff.forEach(s => {
    typeMap.set(s.type, (typeMap.get(s.type) || 0) + 1);
  });

  Array.from(typeMap.entries())
    .sort()
    .forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });

  console.log(`\nTotal: ${allStaff.length} staff members`);

  await app.close();
}

bootstrap();
