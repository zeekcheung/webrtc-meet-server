import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IEnvVariables, isDev } from 'src/utils/env';

/**
 * 数据库配置
 */
const DbConfigModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  // 注入环境配置依赖
  inject: [ConfigService],
  // 使用环境变量配置进行数据库配置
  useFactory: (configService: ConfigService<IEnvVariables, true>) => ({
    // 连接配置
    type: configService.get<any>('DATABASE_TYPE'),
    host: configService.get<string>('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT'),
    username: configService.get<string>('DATABASE_USERNAME'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_DATABASE'),
    // 需要连接的实体
    entities: [],
    // 开发环境下开启数据库同步
    synchronize: isDev(),
    // 连接失败时重新连接的次数
    retryAttempts: 1,
  }),
});

export default DbConfigModule;
