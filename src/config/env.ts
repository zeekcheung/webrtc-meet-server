import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ENV_FILE_PATH } from 'src/utils/env';

/**
 * 环境变量配置
 */
const EnvConfigModule = ConfigModule.forRoot({
  // 自定义.env文件路径
  envFilePath: ENV_FILE_PATH,
  // 注册为全局模块
  isGlobal: true,
  // 开启缓存
  cache: true,
  // 支持变量扩展
  expandVariables: true,
  // Schema校验
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('dev', 'prod').default('dev'),
    PORT: Joi.number().default(3000),
    DATABASE_TYPE: Joi.string()
      .valid('postgres', 'mysql', 'mongodb')
      .default('mysql'),
    DATABASE_HOST: Joi.string().default('localhost'),
    DATABASE_PORT: Joi.number().default(3306),
    DATABASE_USERNAME: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_DATABASE: Joi.string().required(),
  }),
});

export default EnvConfigModule;
