import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { USER_BASE_URL } from 'src/common/constant';
import DbConfigModule from 'src/config/db';
import EnvConfigModule from 'src/config/env';
import { authenticate } from 'src/middleware/authenticate.middle';
import { UsersController } from '../user/users.controller';
import { UserModule } from '../user/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 配置环境变量
    EnvConfigModule,
    // 连接数据库
    DbConfigModule,
    UserModule,
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
      )
      .forRoutes(UsersController);
  }
}
