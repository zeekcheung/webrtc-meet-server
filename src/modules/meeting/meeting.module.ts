import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UsersModule } from '../user/user.module';
import { Meeting } from './entities/meeting.entity';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, User]), UsersModule],
  exports: [TypeOrmModule, MeetingService],
  controllers: [MeetingController],
  providers: [MeetingService],
})
export class MeetingModule {}
