import { Module } from '@nestjs/common';
import DbConfigModule from 'src/config/db';
import EnvConfigModule from 'src/config/env';
import { UserModule } from './../user/user.module';
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
export class AppModule {}
