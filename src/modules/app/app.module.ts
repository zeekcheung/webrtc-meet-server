import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { cwd } from 'process';
import { USER_BASE_URL } from 'src/common/constant';
import DbConfigModule from 'src/config/db';
import EnvConfigModule from 'src/config/env';
import { authenticate } from 'src/middleware/authenticate.middle';
import { MeetingModule } from '../meeting/meeting.module';
import { SignalModule } from '../signal/signal.module';
import { UsersModule } from '../user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 配置环境变量
    EnvConfigModule,
    // 连接数据库
    DbConfigModule,
    UsersModule,
    MeetingModule,
    SignalModule,
    // 集合前端
    ServeStaticModule.forRoot({
      rootPath: join(cwd(), 'public'),
      serveStaticOptions: {
        // 配置强缓存
        maxAge: 2592000,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  // 注册中间件
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authenticate)
      .exclude(
        `${USER_BASE_URL}/register`,
        `${USER_BASE_URL}/login`,
        `${USER_BASE_URL}/logout`,
      );
  }
}
