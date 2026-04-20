import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepository } from 'typeorm';
import { Hospital } from './hospitals/entities/hospital.entity';

async function populateHospitals() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const hospitalRepository = app.get('HospitalRepository');

  const hospitals = [
    {
      name: 'Apollo Premier Hospital',
      address: '123 Medical Plaza, Mumbai, Maharashtra 400001',
      phone: '+91-22-6789-0000',
      email: 'contact@apollomumbai.com',
      website: 'https://www.apollohospitals.com/mumbai',
    },
    {
      name: 'Fortis Healthcare',
      address: '456 Healthcare Center, Delhi, Delhi 110001',
      phone: '+91-11-4123-5000',
      email: 'info@fortisdelhi.com',
      website: 'https://www.fortishealthcare.com/delhi',
    },
    {
      name: 'Max Super Speciality Hospital',
      address: '789 Medical Heights, Bangalore, Karnataka 560001',
      phone: '+91-80-4567-8900',
      email: 'admin@maxbangalore.com',
      website: 'https://www.maxhealthcare.in/bangalore',
    },
    {
      name: 'AIIMS New Delhi',
      address: '321 Government Medical Complex, New Delhi, Delhi 110029',
      phone: '+91-11-2659-3676',
      email: 'contact@aiims.edu',
      website: 'https://www.aiims.edu',
    },
    {
      name: 'Lilavati Hospital',
      address: '654 Marine Drive, Mumbai, Maharashtra 400026',
      phone: '+91-22-6652-5555',
      email: 'helpdesk@lilavati.co.in',
      website: 'https://www.lilavati.co.in',
    },
    {
      name: 'St. Jude\'s Hospital',
      address: '987 Health Park, Pune, Maharashtra 411001',
      phone: '+91-20-2665-1234',
      email: 'contact@stjudespune.com',
      website: 'https://www.stjudespune.com',
    },
    {
      name: 'Manipal Hospitals',
      address: '111 Tech Park, Hyderabad, Telangana 500081',
      phone: '+91-40-6717-1717',
      email: 'info@manipalhyd.com',
      website: 'https://www.manipalhospitals.com/hyderabad',
    },
    {
      name: 'Rainbow Children\'s Hospital',
      address: '222 Pediatric Plaza, Chennai, Tamil Nadu 600004',
      phone: '+91-44-2430-5000',
      email: 'contact@rainbowchildrens.com',
      website: 'https://www.rainbowchildrens.com/chennai',
    },
  ];

  console.log('\n--- POPULATING HOSPITALS ---');
  const existingCount = await hospitalRepository.count();
  console.log(`Found ${existingCount} existing hospital(s)\n`);

  let createdCount = 0;

  for (const hospitalData of hospitals) {
    const existing = await hospitalRepository.findOne({
      where: { email: hospitalData.email },
    });

    if (existing) {
      console.log(`⊘ ${hospitalData.name}: already exists (${existing.id})`);
    } else {
      const hospital = hospitalRepository.create(hospitalData);
      await hospitalRepository.save(hospital);
      console.log(`✓ ${hospitalData.name}: created (${hospital.id})`);
      createdCount++;
    }
  }

  console.log(`\n✅ Hospital population complete! Created ${createdCount} new hospital(s)`);
  await app.close();
}

populateHospitals().catch(console.error);
