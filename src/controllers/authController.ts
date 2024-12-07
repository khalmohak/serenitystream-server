import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authServices';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const deviceInfo = {
        deviceId: req.body.deviceId,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      };

      const result = await this.authService.login(email, password, deviceInfo);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        accessToken: result.accessToken,
        user: result.user
      });
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const deviceInfo = {
        deviceId: req.body.deviceId,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      };

      const result = await this.authService.refresh(refreshToken, deviceInfo);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        accessToken: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      await this.authService.logout(refreshToken);

      res.clearCookie('refreshToken');
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };

  public logoutAllDevices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      //@ts-ignore
      await this.authService.logoutAllDevices(req.user.id);
      res.clearCookie('refreshToken');
      res.status(200).json({ message: 'Logged out from all devices successfully' });
    } catch (error) {
      next(error);
    }
  };
  
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName, role, phoneNumber, countryCode } = req.body;
      const result = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        role,
        phoneNumber, 
        countryCode
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
  
  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);
      res.json({ message: 'Password reset instructions sent to email' });
    } catch (error) {
      next(error);
    }
  };
  
  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;
      await this.authService.resetPassword(token, newPassword);
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  };
  
  public verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      await this.authService.verifyEmail(token);
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  };
  
  public verifyPhone = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { otp, phone } = req.params;
      await this.authService.verifyPhone(phone, otp);
      res.json({ message: 'Phone verified successfully' });
    } catch (error) {
      next(error);
    }
  };
  
  public resendEmailVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await this.authService.resendEmailVerification(email);
      res.json({ message: 'Verification email resent successfully' });
    } catch (error) {
      next(error);
    }
  };
  
  public resendPhoneVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone } = req.body;
      await this.authService.resendPhoneVerification(phone);
      res.json({ message: 'Verification OTP resent successfully' });
    } catch (error) {
      next(error);
    }
  };
}