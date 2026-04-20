import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HospitalsService } from './hospitals/hospitals.service';
import { Bed, BedType, BedStatus } from './beds/entities/bed.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const hospitalsService = app.get(HospitalsService);
  const bedRepository = app.get<Repository<Bed>>(getRepositoryToken(Bed));

  console.log('--- POPULATING BEDS ---');

  // Get all hospitals
  const hospitals = await hospitalsService.findAll();
  if (hospitals.length === 0) {
    console.error('❌ No hospital found!');
    process.exit(1);
  }

  console.log(`Found ${hospitals.length} hospital(s)`);

  let totalCreated = 0;

  for (const hospital of hospitals) {
    console.log(`\n📍 Hospital: ${hospital.name} (${hospital.id})`);

    // Define beds to create for each hospital
    const bedsData = [
      // General Beds
      { type: BedType.GENERAL, pricePerDay: 500, count: 15 },
      // ICU Beds
      { type: BedType.ICU, pricePerDay: 2500, count: 8 },
      // Private Beds
      { type: BedType.PRIVATE, pricePerDay: 1500, count: 6 },
      // Ventilator Beds
      { type: BedType.VENTILATOR, pricePerDay: 4000, count: 4 },
    ];

    for (const bedConfig of bedsData) {
      // Check how many beds of this type already exist
      const existingBeds = await bedRepository.count({
        where: {
          hospitalId: hospital.id,
          type: bedConfig.type,
        },
      });

      const bedsToCreate = bedConfig.count - existingBeds;

      if (bedsToCreate <= 0) {
        console.log(`  ⊘ ${bedConfig.type}: ${existingBeds} beds already exist`);
        continue;
      }

      for (let i = 0; i < bedsToCreate; i++) {
        const bed = bedRepository.create({
          hospitalId: hospital.id,
          type: bedConfig.type,
          status: BedStatus.AVAILABLE,
          pricePerDay: bedConfig.pricePerDay,
        });

        await bedRepository.save(bed);
        totalCreated++;
      }

      console.log(`  ✓ ${bedConfig.type}: created ${bedsToCreate} new beds (total: ${existingBeds + bedsToCreate})`);
    }
  }

  console.log(`\n✅ Bed population complete! Created ${totalCreated} new beds`);
  process.exit(0);
}

bootstrap().catch((error) => {
  console.error('❌ Error during bed population:', error);
  process.exit(1);
});
