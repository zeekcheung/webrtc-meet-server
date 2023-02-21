import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { encryptText } from 'src/utils/crypto';
import { getDatetime } from 'src/utils/date';
import { Repository } from 'typeorm';
import { UsersService } from '../user/user.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { Meeting } from './entities/meeting.entity';

@Injectable()
export class MeetingService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    private readonly userService: UsersService,
  ) {}

  async create({ host_username, password, ...rest }: CreateMeetingDto) {
    const host = await this.userService.findOne(host_username);
    const meeting = this.meetingRepository.create({
      host,
      id: randomUUID(),
      start_time: getDatetime(),
      attendees: [host],
      password: encryptText(password),
      ...rest,
    });
    return this.meetingRepository.save(meeting);
  }

  async findOne(id: Meeting['id']) {
    return await this.meetingRepository.findOne({
      where: { id },
      relations: ['host', 'attendees'],
    });
  }

  async findAll({ limit, offset }: PaginationQueryDto) {
    return this.meetingRepository.find({
      relations: ['host', 'attendees'],
      // 分页查询
      skip: offset,
      take: limit,
    });
  }

  async update(id: Meeting['id'], updateMeetingDto: UpdateMeetingDto) {
    const meeting = await this.meetingRepository.preload({
      id,
      ...updateMeetingDto,
    });
    if (!meeting) {
      throw new NotFoundException(`Meeting #${id} not found`);
    }
    // 将新的实体实例保存到数据库中
    return this.meetingRepository.save(meeting);
  }
}
