import { IsAscii, IsOptional, IsString, Max, Min } from 'class-validator';
import { User } from 'src/modules/user/entities/user.entity';
import { Meeting } from '../entities/meeting.entity';

export class CreateMeetingDto {
  @IsString()
  host_username: User['username'];

  @IsString()
  @IsAscii()
  name: Meeting['name'];

  @IsOptional()
  @IsString()
  password: Meeting['password'];

  @Min(1)
  @Max(10)
  size: Meeting['size'];
}
