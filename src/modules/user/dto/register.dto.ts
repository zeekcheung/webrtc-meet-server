import {
  IsAlphanumeric,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';
import { User } from '../entities/user.entity';

// 数据校验
export class RegisterDto {
  @IsString()
  @Length(4, 12)
  @IsAlphanumeric()
  readonly username: User['username'];

  @IsString()
  @Length(4, 12)
  @IsAlphanumeric()
  readonly nickname: User['nickname'];

  @IsStrongPassword(
    {
      minNumbers: 3,
      minSymbols: 1,
      minLowercase: 2,
      minUppercase: 2,
    },
    {
      message: `Password must contains at least 3 number, 1 symbol, 2 lowercase and 2 uppercase!`,
    },
  )
  readonly password: User['password'];
}
