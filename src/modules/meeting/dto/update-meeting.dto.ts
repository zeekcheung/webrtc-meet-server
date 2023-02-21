import { PartialType } from '@nestjs/mapped-types';
import { Meeting } from '../entities/meeting.entity';

export class UpdateMeetingDto extends PartialType(Meeting) {}
