import { securityMiddleware } from "../middleware/securityMiddleware";
import { morganLogger } from "./morgan.config";

export const securityConfig = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    
    // Token settings
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '7d',
    
    // Cookie settings
    COOKIE_SECRET: process.env.COOKIE_SECRET || 'your-cookie-secret',
    
    // Session settings (if using sessions)
    SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret',
    SESSION_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
    
    // Rate limiting
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
    
    // Allowed file types (if handling file uploads)
    ALLOWED_FILE_TYPES: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};


export const setupSecurity = (app: any) => {
    // Apply security middlewares
    app.use(securityMiddleware.helmet);
    app.use(securityMiddleware.cors);
    app.use(securityMiddleware.xss);
    app.use(securityMiddleware.hpp);
    app.use(securityMiddleware.requestSizeLimiter);

    // Apply rate limiters
    app.use(securityMiddleware.rateLimiter);
    app.use('/api/auth/login', securityMiddleware.loginRateLimiter);

    // Apply Morgan logger based on environment
    if (process.env.NODE_ENV === 'development') {
        app.use(morganLogger.dev);
    } else {
        app.use(morganLogger.prod);
    }
};