import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodBank } from './entities/blood-bank.entity';
import { ResourceHospital } from './entities/resource-hospital.entity';
import { PoliceStation } from './entities/police-station.entity';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(BloodBank)
    private bloodBankRepository: Repository<BloodBank>,
    @InjectRepository(ResourceHospital)
    private hospitalRepository: Repository<ResourceHospital>,
    @InjectRepository(PoliceStation)
    private policeStationRepository: Repository<PoliceStation>,
  ) {}

  // Haversine formula to calculate distance between two GPS points
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // BLOOD BANKS
  async getAllBloodBanks() {
    return this.bloodBankRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getNearestBloodBanks(latitude: number, longitude: number, radius = 5) {
    const banks = await this.bloodBankRepository.find();
    return banks
      .map((bank) => ({
        ...bank,
        distance: this.calculateDistance(latitude, longitude, bank.latitude, bank.longitude),
      }))
      .filter((bank) => bank.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  async createBloodBank(data: any) {
    const bank = this.bloodBankRepository.create(data);
    return this.bloodBankRepository.save(bank);
  }

  async updateBloodBank(id: string, data: any) {
    await this.bloodBankRepository.update(id, data);
    return this.bloodBankRepository.findOne({ where: { id } });
  }

  async deleteBloodBank(id: string) {
    const bank = await this.bloodBankRepository.findOne({ where: { id } });
    if (!bank) throw new NotFoundException('Blood bank not found');
    await this.bloodBankRepository.delete(id);
    return { message: 'Blood bank deleted' };
  }

  // HOSPITALS
  async getAllHospitals() {
    return this.hospitalRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getNearestHospitals(latitude: number, longitude: number, radius = 10) {
    const hospitals = await this.hospitalRepository.find();
    return hospitals
      .map((hospital) => ({
        ...hospital,
        distance: this.calculateDistance(latitude, longitude, hospital.latitude, hospital.longitude),
      }))
      .filter((hospital) => hospital.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  async createHospital(data: any) {
    const hospital = this.hospitalRepository.create(data);
    return this.hospitalRepository.save(hospital);
  }

  async updateHospital(id: string, data: any) {
    await this.hospitalRepository.update(id, data);
    return this.hospitalRepository.findOne({ where: { id } });
  }

  async deleteHospital(id: string) {
    const hospital = await this.hospitalRepository.findOne({ where: { id } });
    if (!hospital) throw new NotFoundException('Hospital not found');
    await this.hospitalRepository.delete(id);
    return { message: 'Hospital deleted' };
  }

  // POLICE STATIONS
  async getAllPoliceStations() {
    return this.policeStationRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getNearestPoliceStations(latitude: number, longitude: number, radius = 5) {
    const stations = await this.policeStationRepository.find();
    return stations
      .map((station) => ({
        ...station,
        distance: this.calculateDistance(latitude, longitude, station.latitude, station.longitude),
      }))
      .filter((station) => station.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  async createPoliceStation(data: any) {
    const station = this.policeStationRepository.create(data);
    return this.policeStationRepository.save(station);
  }

  async updatePoliceStation(id: string, data: any) {
    await this.policeStationRepository.update(id, data);
    return this.policeStationRepository.findOne({ where: { id } });
  }

  async deletePoliceStation(id: string) {
    const station = await this.policeStationRepository.findOne({ where: { id } });
    if (!station) throw new NotFoundException('Police station not found');
    await this.policeStationRepository.delete(id);
    return { message: 'Police station deleted' };
  }
}
