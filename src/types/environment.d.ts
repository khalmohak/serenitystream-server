declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: 'development' | 'production' | 'test';
      DB_HOST:string,
      DB_PORT:string,
      DB_USER:string,
      DB_PASSWORD:string,
      DB_NAME:string,
      JWT_SECRET:string,
      JWT_REFRESH_SECRET:string,
    }
  }
}

export {};
