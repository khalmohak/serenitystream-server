import { Repository } from "typeorm";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../data-source";
import { HttpException } from "../exceptions/HttpException";
import { RefreshToken, User, UserRole, UserVerification } from "../entities";
import { config } from "../config/config";
import { Instructor, InstructorType } from "../entities/Instructor";

export class AuthService {
  private userRepository: Repository<User>;
  private tokenRepository: Repository<RefreshToken>;
  private userVerificationRepository: Repository<UserVerification>;
  private instructorRepository: Repository<Instructor>;
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private TOKEN_EXPIRY = {
    EMAIL: 24 * 60 * 60 * 1000, // 24 hours
    PHONE: 10 * 60 * 1000 // 10 minutes
  };

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.tokenRepository = AppDataSource.getRepository(RefreshToken);
    this.userVerificationRepository =
      AppDataSource.getRepository(UserVerification);
    this.instructorRepository = AppDataSource.getRepository(Instructor);
    this.JWT_SECRET = config.jwt.secret;
    this.JWT_REFRESH_SECRET = config.jwt.refreshSecret;
  }

  public async login(email: string, password: string, deviceInfo: any) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(401, "Invalid credentials");
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, deviceInfo);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  public async refresh(refreshTokenString: string, deviceInfo: any) {
    const refreshToken = await this.tokenRepository.findOne({
      where: { token: refreshTokenString, isValid: true },
      relations: ["user"],
    });

    if (!refreshToken || new Date() > refreshToken.expiresAt) {
      throw new HttpException(401, "Invalid refresh token");
    }

    const accessToken = this.generateAccessToken(refreshToken.user);
    const newRefreshToken = await this.generateRefreshToken(
      refreshToken.user,
      deviceInfo,
    );

    // Invalidate old refresh token
    refreshToken.isValid = false;
    await this.tokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken.token,
    };
  }

  public async logout(refreshTokenString: string) {
    const refreshToken = await this.tokenRepository.findOne({
      where: { token: refreshTokenString },
    });

    if (refreshToken) {
      refreshToken.isValid = false;
      await this.tokenRepository.save(refreshToken);
    }
  }

  public async logoutAllDevices(userId: string) {
    await this.tokenRepository.update(
      { userId, isValid: true },
      { isValid: false },
    );
  }

  private generateAccessToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      this.JWT_SECRET,
      { expiresIn: "24h" },
    );
  }

  private async generateRefreshToken(
    user: User,
    deviceInfo: any,
  ): Promise<RefreshToken> {
    const token = jwt.sign(
      { id: user.id, version: uuidv4() },
      this.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    const refreshToken = new RefreshToken();
    refreshToken.token = token;
    refreshToken.userId = user.id;
    refreshToken.deviceId = deviceInfo.deviceId || uuidv4();
    refreshToken.userAgent = deviceInfo.userAgent;
    refreshToken.ipAddress = deviceInfo.ipAddress;
    refreshToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return this.tokenRepository.save(refreshToken);
  }

  public async register({
    email,
    password,
    firstName,
    lastName,
    role,
    phoneNumber,
    countryCode,
    imageUrl
  }) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException(400, "Email already registered");
    }

    const user = this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      countryCode,
      role,
      imageUrl
    });
    await this.userRepository.save(user);

    const verification = this.userVerificationRepository.create({
      user,
      emailVerificationToken: uuidv4(),
      phoneVerificationToken: this.generateOTP()
    });
    
    await this.userVerificationRepository.save(verification);

    await this.sendVerificationEmail(
      user.email,
      verification.emailVerificationToken,
    );
    if (phoneNumber) {
      await this.sendVerificationSMS(
        phoneNumber,
        verification.phoneVerificationToken,
      );
    }
    
    if(user.role === UserRole.INSTRUCTOR) {
      const instructor = this.instructorRepository.create({
        user,
        type:InstructorType.INDEPENDENT,
        id:user.id
      })
      await this.instructorRepository.save(instructor);
      console.log("Instructor Created");
    }

    return {
      message: "Registration successful. Please verify your email/phone.",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  public async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return {
        message:
          "If your email is registered, you will receive password reset instructions",
      };
    }

    const verification = await this.userVerificationRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!verification) {
      throw new HttpException(400, "User verification record not found");
    }

    verification.emailVerificationToken = uuidv4();
    await this.userVerificationRepository.save(verification);

    await this.sendPasswordResetEmail(
      email,
      verification.emailVerificationToken,
    );
    return {
      message:
        "If your email is registered, you will receive password reset instructions",
    };
  }

  public async resetPassword(token: string, newPassword: string) {
    const verification = await this.userVerificationRepository.findOne({
      where: { emailVerificationToken: token },
      relations: ["user"],
    });

    if (!verification) {
      throw new HttpException(400, "Invalid or expired token");
    }

    verification.user.password = newPassword;
    verification.emailVerificationToken = null;

    await this.userRepository.save(verification.user);
    await this.userVerificationRepository.save(verification);

    return { message: "Password reset successfully" };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendVerificationEmail(email: string, token: any) {
    console.log(`Verification email sent to ${email} with token ${token}`);
  }

  private async sendVerificationSMS(phone: string, otp: any) {
    console.log(`Verification SMS sent to ${phone} with OTP ${otp}`);
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    console.log(`Password reset email sent to ${email} with token ${token}`);
  }
  
  private async generateVerificationRecord(user: User, type: 'email' | 'phone' | 'both'): Promise<UserVerification> {
    const verification = await this.userVerificationRepository.findOne({
      where: { user: { id: user.id } }
    }) || this.userVerificationRepository.create({ user });
  
    const now = new Date();
  
    if (type === 'email' || type === 'both') {
      verification.emailVerificationToken = uuidv4();
      verification.emailTokenExpiresAt = new Date(now.getTime() + this.TOKEN_EXPIRY.EMAIL);
    }
  
    if (type === 'phone' || type === 'both') {
      verification.phoneVerificationToken = this.generateOTP();
      verification.phoneTokenExpiresAt = new Date(now.getTime() + this.TOKEN_EXPIRY.PHONE);
    }
  
    return this.userVerificationRepository.save(verification);
  }
  
  public async resendEmailVerification(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException(404, 'User not found');
    }
  
    const verification = await this.userVerificationRepository.findOne({
      where: { user: { id: user.id } }
    });
  
    if (!verification) {
      throw new HttpException(400, 'No verification record found');
    }
  
    if (verification.isEmailVerified) {
      throw new HttpException(400, 'Email is already verified');
    }
  
    const now = new Date();
    const lastEmailSent = verification.emailTokenExpiresAt 
      ? new Date(verification.emailTokenExpiresAt.getTime() - this.TOKEN_EXPIRY.EMAIL)
      : new Date(0);
  
    if (now.getTime() - lastEmailSent.getTime() < 5 * 60 * 1000) {
      throw new HttpException(400, 'Please wait 5 minutes before requesting another verification email');
    }
  
    const updatedVerification = await this.generateVerificationRecord(user, 'email');
    await this.sendVerificationEmail(user.email, updatedVerification.emailVerificationToken!);
  }
  
  public async resendPhoneVerification(phoneNumber: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new HttpException(404, 'User not found');
    }
  
    const verification = await this.userVerificationRepository.findOne({
      where: { user: { id: user.id } }
    });
  
    if (!verification) {
      throw new HttpException(400, 'No verification record found');
    }
  
    if (verification.isPhoneVerified) {
      throw new HttpException(400, 'Phone is already verified');
    }
  
    // Check if the last OTP was generated within the last minute
    const now = new Date();
    const lastOTPSent = verification.phoneTokenExpiresAt 
      ? new Date(verification.phoneTokenExpiresAt.getTime() - this.TOKEN_EXPIRY.PHONE)
      : new Date(0);
  
    if (now.getTime() - lastOTPSent.getTime() < 60 * 1000) {
      throw new HttpException(400, 'Please wait 1 minute before requesting another OTP');
    }
  
    const updatedVerification = await this.generateVerificationRecord(user, 'phone');
    await this.sendVerificationSMS(user.phoneNumber!, updatedVerification.phoneVerificationToken!);
  }
  
  public async verifyEmail(token: string): Promise<void> {
    const verification = await this.userVerificationRepository.findOne({
      where: { emailVerificationToken: token },
      relations: ['user']
    });
  
    if (!verification || verification.isEmailVerified) {
      throw new HttpException(400, 'Invalid verification token');
    }
  
    if (!verification.emailTokenExpiresAt || new Date() > verification.emailTokenExpiresAt) {
      throw new HttpException(400, 'Verification token has expired');
    }
  
    verification.isEmailVerified = true;
    verification.emailVerificationToken = null;
    verification.emailTokenExpiresAt = null;
    await this.userVerificationRepository.save(verification);
  }
  
  public async verifyPhone(phone: string, otp: string): Promise<void> {
    const verification = await this.userVerificationRepository.findOne({
      where: { phoneVerificationToken: otp },
      relations: ['user']
    });
  
    if (!verification || verification.isPhoneVerified || verification.user.phoneNumber !== phone) {
      throw new HttpException(400, 'Invalid OTP');
    }
  
    if (!verification.phoneTokenExpiresAt || new Date() > verification.phoneTokenExpiresAt) {
      throw new HttpException(400, 'OTP has expired');
    }
  
    verification.isPhoneVerified = true;
    verification.phoneVerificationToken = null;
    verification.phoneTokenExpiresAt = null;
    await this.userVerificationRepository.save(verification);
  }
  
  
  public async getUser(id:string):Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        id
      }
    });
  }
}
