import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MEETING_BASE_URL } from 'src/common/constant';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UsersService } from '../user/user.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { Meeting } from './entities/meeting.entity';
import { MeetingService } from './meeting.service';

@Controller(MEETING_BASE_URL)
export class MeetingController {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly userService: UsersService,
  ) {}

  // POST /api/meeting
  @Post()
  async create(@Body() createMeetingDto: CreateMeetingDto) {
    // 创建会议
    return await this.meetingService.create(createMeetingDto);
  }

  // GET /api/meeting/:id
  @Get(':id')
  async findOne(@Param('id') id: Meeting['id']) {
    return this.meetingService.findOne(id);
  }

  // GET /api/meeting?limit=2&offset=2
  @Get()
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.meetingService.findAll(paginationQueryDto);
  }
}
