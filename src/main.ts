/* eslint-disable @typescript-eslint/no-var-requires */
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import * as session from 'express-session';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from 'redis';
import { ORIGIN, SESSION_ID_NAME } from './common/constant';
import { allowPrivateNetworkMiddleware } from './middleware/allow-private-network.middle';
import { AppModule } from './modules/app/app.module';

const RedisStore = require('connect-redis')(session);

async function bootstrap() {
  // 创建 https 服务器
  const httpsOptions = {
    key: readFileSync(resolve('./secrets/private-key.pem')),
    cert: readFileSync(resolve('./secrets/public-certificate.pem')),
  };

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug'],
    httpsOptions,
  });

  // 获取环境变量
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

  // 连接 Redis
  const redisClient = createClient({ legacyMode: true });
  redisClient.connect().catch(console.error);

  // 注册 allowPrivateNetworkMiddleware 中间件
  app.use(allowPrivateNetworkMiddleware);

  // 注册 express-session 中间件
  app.use(
    session({
      name: SESSION_ID_NAME,
      secret: randomUUID(),
      // 使用 Redis 存储 session
      store: new RedisStore({ client: redisClient }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  // 注册 cookie-parser 中间件
  app.use(cookieParser());

  // 配置跨域
  app.enableCors({
    origin: ORIGIN,
    credentials: true,
  });

  // 开启数据校验
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(port);
}
bootstrap();
