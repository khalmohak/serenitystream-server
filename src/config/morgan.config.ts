import morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';
import * as rfs from 'rotating-file-stream';

const logDirectory = path.join(__dirname, '../logs');

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', 
    path: logDirectory
});

morgan.token('body', (req: any) => {
    const body = { ...req.body };
    if (body.password) body.password = '***';
    if (body.refreshToken) body.refreshToken = '***';
    return JSON.stringify(body);
});

const customFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms :body';

export const morganLogger = {
    dev: morgan('dev'),
    prod: morgan(customFormat, { stream: accessLogStream })
};