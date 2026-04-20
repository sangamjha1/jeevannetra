import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private gateway: NotificationsGateway,
  ) {}

  async create(userId: string, title: string, message: string, type: string = 'SYSTEM') {
    const notification = this.notificationRepository.create({
      userId,
      title,
      message,
      type,
    });
    const savedNotification = await this.notificationRepository.save(notification);
    this.gateway.notifyUser(userId, savedNotification);
    return savedNotification;
  }

  async findByUser(userId: string) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    await this.notificationRepository.update(id, { isRead: true });
    return this.notificationRepository.findOne({ where: { id } });
  }
}
