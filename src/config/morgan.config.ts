import morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';
import * as rfs from 'rotating-file-stream';

const logDirectory = path.join(__dirname, '../logs');

// Ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // Rotate daily
    path: logDirectory
});

// Custom token for request body
morgan.token('body', (req: any) => {
    const body = { ...req.body };
    if (body.password) body.password = '***';
    if (body.refreshToken) body.refreshToken = '***';
    return JSON.stringify(body);
});

// Custom format
const customFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms :body';

export const morganLogger = {
    // Development logging
    dev: morgan('dev'),
    
    // Production logging to file
    prod: morgan(customFormat, { stream: accessLogStream })
};