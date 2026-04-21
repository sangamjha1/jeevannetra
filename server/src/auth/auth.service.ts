import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Resend } from 'resend';
import { Role, User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');
  private resend: Resend;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {
    // Initialize Resend
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

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

    // Send email via Resend
    try {
      if (this.resend && process.env.RESEND_FROM_EMAIL) {
        await this.resend.emails.send({
          from: `JeevanNetra HMS <${process.env.RESEND_FROM_EMAIL}>`,
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
        this.logger.log(`✅ Password reset email sent to ${email}`);
      } else {
        // Fallback to console logging if Resend not configured
        this.logger.log(`\n⚠️  Resend not configured. Reset code for ${email}:`);
        this.logger.log(`   Code: ${resetCode}`);
        this.logger.log(`   Expires in: 15 minutes\n`);
      }
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      // Continue anyway - user can still use the code from logs in dev
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
}
