import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { CreateBillDto, UpdateBillStatusDto } from './dto/bill.dto';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { Patient } from '../patients/entities/patient.entity';
import PDFDocument from 'pdfkit';
import type { Response } from 'express';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(Hospital)
    private hospitalRepository: Repository<Hospital>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async create(createBillDto: CreateBillDto) {
    const invoiceNumber = `INV-${Date.now()}`;
    const bill = this.billRepository.create({
      ...createBillDto,
      invoiceNumber,
      items: createBillDto.items,
      status: 'UNPAID',
    });
    
    const savedBill = await this.billRepository.save(bill);
    return this.findOne(savedBill.id);
  }

  async findByPatient(userId: string) {
    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.billRepository.find({
      where: { patientId: patient.id },
      relations: ['hospital', 'appointment'],
      order: { date: 'DESC' },
    });
  }

  async findByHospital(hospitalId: string) {
    const hospital = await this.hospitalRepository.findOne({ where: { userId: hospitalId } });
    if (!hospital) throw new NotFoundException('Hospital not found');

    return this.billRepository.find({
      where: { hospitalId: hospital.id },
      relations: ['patient', 'patient.user', 'appointment'],
      order: { date: 'DESC' },
    });
  }

  async findByDoctor(doctorUserId: string) {
    // For doctors, return recent bills/earnings (from their appointments and consultations)
    // This is a simplified version - in a full system, you'd track doctor-bill relationships
    return this.billRepository.find({
      relations: ['patient', 'patient.user', 'appointment'],
      order: { date: 'DESC' },
      take: 20,
    });
  }

  async findAll() {
    return this.billRepository.find({
      relations: ['patient', 'patient.user', 'hospital', 'appointment'],
      order: { date: 'DESC' },
    });
  }

  async updateStatus(id: string, updateBillStatusDto: UpdateBillStatusDto) {
    await this.billRepository.update(id, { status: updateBillStatusDto.status });
    return this.findOne(id);
  }

  async findOne(id: string) {
    const bill = await this.billRepository.findOne({
      where: { id },
      relations: ['patient', 'patient.user', 'hospital', 'appointment'],
    });
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  async generatePdf(id: string, res: Response) {
    const bill = await this.findOne(id);

    const doc = new PDFDocument();
    doc.pipe(res);

    // PDF Content
    doc.fontSize(25).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Invoice Number: ${bill.invoiceNumber}`);
    doc.text(`Date: ${bill.date.toDateString()}`);
    doc.text(`Status: ${bill.status}`);
    doc.moveDown();

    doc.text(`Hospital: ${bill.hospital.name}`);
    doc.text(`Address: ${bill.hospital.address}`);
    doc.moveDown();

    doc.text(`Patient: ${bill.patient.user.firstName} ${bill.patient.user.lastName}`);
    doc.text(`Email: ${bill.patient.user.email}`);
    doc.moveDown();

    doc.text('Items:', { underline: true });
    (bill.items as any[]).forEach((item) => {
      doc.text(`${item.name}: $${item.amount}`);
    });

    doc.moveDown();
    doc.fontSize(18).text(`Total Amount: $${bill.amount}`, { align: 'right' });

    doc.end();
  }
}
