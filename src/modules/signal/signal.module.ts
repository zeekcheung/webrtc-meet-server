import { Module } from '@nestjs/common';
import { MeetingModule } from '../meeting/meeting.module';
import { UsersModule } from '../user/user.module';
import { SignalGateway } from './signal.gateway';

@Module({
  providers: [SignalGateway],
  imports: [MeetingModule, UsersModule],
})
export class SignalModule {}
