import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * 环境变量
 */
export interface IEnvVariables {
  NODE_ENV: 'dev' | 'prod';
  PORT: number;
  DATABASE_TYPE: TypeOrmModuleOptions['type'];
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  DATABASE_DATABASE: string;
}

export const NODE_ENV = (process.env.NODE_ENV ||
  'prod') as IEnvVariables['NODE_ENV'];

export const isDev = () => NODE_ENV === 'dev';
export const isProd = () => NODE_ENV === 'prod';

export const ENV_FILE_PATH = isDev() ? '.env.dev' : '.env.prod';
