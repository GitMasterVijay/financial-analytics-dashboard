import 'dotenv/config';

interface EnvConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  analystEmail: string;
  analystPassword: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export const config: EnvConfig = {
  port: parseInt(getEnvVar('PORT', '5000'), 10),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
  mongodbUri: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/financial-analytics-db'),
  jwtSecret: getEnvVar('JWT_SECRET'),
  jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '24h'),
  analystEmail: getEnvVar('ANALYST_EMAIL'),
  analystPassword: getEnvVar('ANALYST_PASSWORD'),
};
