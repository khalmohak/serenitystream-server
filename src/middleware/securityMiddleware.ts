import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { Request, Response, NextFunction } from 'express';

// Use require for modules without proper types
// @ts-ignore
const helmet = require('helmet');
// @ts-ignore
const xss = require('xss-clean');
// @ts-ignore
const cors = require('cors');

export const securityMiddleware = {
    helmet: helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: { policy: "same-site" },
        dnsPrefetchControl: true,
        frameguard: { action: "deny" },
        hidePoweredBy: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: true,
        referrerPolicy: { policy: "same-origin" },
        xssFilter: true,
    }),

    // CORS configuration
    cors: cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        credentials: true,
        maxAge: 600 // 10 minutes
    }),

    // Rate limiting
    rateLimiter: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later',
        standardHeaders: true,
        legacyHeaders: false,
    }),

    // Login rate limiting (more strict)
    loginRateLimiter: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // Limit each IP to 5 login requests per hour
        message: 'Too many login attempts from this IP, please try again after an hour',
        standardHeaders: true,
        legacyHeaders: false,
    }),

    // XSS protection
    xss: xss(),

    // HPP (HTTP Parameter Pollution) protection
    hpp: hpp(),

    // Request size limiter
    requestSizeLimiter: (req: Request, res: Response, next: NextFunction) => {
        const MAX_BODY_SIZE = '10kb';
        if (req.headers['content-length'] && 
            parseInt(req.headers['content-length']) > parseInt(MAX_BODY_SIZE) * 1024) {
            return res.status(413).json({
                status: 'error',
                message: 'Request entity too large'
            });
        }
        next();
    }
};
