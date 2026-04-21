import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Role, User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async signup(data: any): Promise<User> {
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Parse date if provided
    const dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : undefined;
    
    const user = await this.usersService.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      role: data.role,
      address: data.address || null,
      gender: data.gender || null,
      dateOfBirth: dateOfBirth,
    });

    // Create patient profile if registering as patient with medical data
    if (user.role === Role.PATIENT) {
      const existingProfile = await this.patientRepository.findOne({ where: { userId: user.id } });
      if (!existingProfile) {
        const patientData = {
          userId: user.id,
          bloodGroup: data.bloodGroup || null,
          height: data.height ? parseFloat(data.height) : null,
          weight: data.weight ? parseFloat(data.weight) : null,
          emergencyContact: data.emergencyContact || null,
        } as any;
        await this.patientRepository.save(this.patientRepository.create(patientData));
      }
    }

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
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return { success: true, message: 'If an account exists with this email, a reset code has been sent.' };
    }

    // Generate random 6-character reset code
    const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Set expiry to 15 minutes from now
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);

    // Save to database
    await this.usersService.update(user.id, {
      passwordResetCode: resetCode,
      passwordResetCodeExpiry: expiryTime,
    } as any);

    // Log for local testing
    this.logger.log(`\n✅ PASSWORD RESET CODE FOR ${email}:`);
    this.logger.log(`   Code: ${resetCode}`);
    this.logger.log(`   Expires in: 15 minutes`);
    this.logger.log(`   (In production, this would be sent via email)\n`);

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
}
