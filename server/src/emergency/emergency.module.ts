import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmergencyService } from './emergency.service';
import { EmergencyController } from './emergency.controller';
import { EmergencyRequest } from './entities/emergency-request.entity';
import { AccidentReport } from './entities/accident-report.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmergencyRequest, AccidentReport, User])],
  providers: [EmergencyService],
  controllers: [EmergencyController],
  exports: [EmergencyService],
})
export class EmergencyModule {}
