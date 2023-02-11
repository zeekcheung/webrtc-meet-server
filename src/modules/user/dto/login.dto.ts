import { PickType } from '@nestjs/mapped-types';
import { RegisterDto } from './register.dto';

export class LoginDto extends PickType(RegisterDto, ['username', 'password']) {}
