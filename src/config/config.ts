import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getRequiredEnv = (key: keyof NodeJS.ProcessEnv): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const parsePort = (port: string): number => {
  const parsedPort = parseInt(port, 10);
  if (isNaN(parsedPort)) {
    throw new Error('Port must be a valid number');
  }
  return parsedPort;
};

const validateNodeEnv = (env: string): 'development' | 'production' | 'test' => {
  if (!['development', 'production', 'test'].includes(env)) {
    throw new Error('NODE_ENV must be development, production, or test');
  }
  return env as 'development' | 'production' | 'test';
};

export const config = {
  port: parsePort(getRequiredEnv('PORT')),
  nodeEnv: validateNodeEnv(getRequiredEnv('NODE_ENV')),
  
  database: {
    host: getRequiredEnv('DB_HOST'),
    port: parsePort(getRequiredEnv('DB_PORT')),
    username: getRequiredEnv('DB_USER'),
    password: getRequiredEnv('DB_PASSWORD'),
    database: getRequiredEnv('DB_NAME'),
    
    get url(): string {
      return `postgresql://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}`;
    }
  },
  
  jwt: {
    secret: getRequiredEnv('JWT_SECRET'),
    refreshSecret: getRequiredEnv('JWT_REFRESH_SECRET'),
  },
  
  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  },
  
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  },
  
  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }
} as const;

export type Config = typeof config;

export type DatabaseConfig = Config['database'];
export type JWTConfig = Config['jwt'];