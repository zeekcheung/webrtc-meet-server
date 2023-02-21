import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { USER_BASE_URL } from 'src/common/constant';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { decryptText } from 'src/utils/crypto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from './user.service';

@Controller(USER_BASE_URL)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /api/user/register
  @Post('register')
  async register(@Body() body: RegisterDto) {
    // 判断用户名是否已经存在
    if (await this.usersService.isExist(body.username)) {
      throw new BadRequestException(`User ${body.username} already exists!`);
    }
    // 写入数据库
    return await this.usersService.create(body);
  }

  // POST /api/user/login
  @Post('login')
  async login(
    @Body() { username, password }: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 判断用户是否存在
    const user = await this.usersService.findOne(username);
    if (user === null) {
      throw new NotFoundException(`User ${username} not found!`);
    }
    // 判断密码是否正确
    const decryptedPassword = decryptText(user.password);
    if (password !== decryptedPassword) {
      throw new BadRequestException(`The password is incorrect!`);
    }

    /**
     * 将用户数据写入 session（保存在 Redis 中），保存登录状态
     * 当向 session 对象中写入数据时，express-session 中间件就会自动
     * 将 sessionId 通过 set-cookie 字段返回给客户端
     * 写入数据后，需要手动将 session 保存回 Redis 中，并重新加载 session
     */
    const session = req.session;
    session[username] = user;
    session.save(() => {
      session.reload(() => {
        // console.log(session);
      });
    });

    // 在 cookie 中设置 username
    res.cookie('username', username);

    return user;
  }

  // GET /api/user/logout
  @Get('logout')
  logout(@Req() req: Request) {
    /**
     * 将用户数据从 session 中删除，取消登录状态
     * 删除数据后，需要手动将 session 保存回 Redis 中，并重新加载 session
     */
    const session = req.session;
    delete session[session.id];
    session.save(() => {
      session.reload(() => {
        // console.log(session);
      });
    });
  }

  // GET /api/user/profile
  @Get('profile')
  profile(@Req() req: Request) {
    // 通过 cookie 中的 username 从 session 中获取用户信息
    const cookies = req.cookies;
    const session = req.session;
    const username = cookies['username'];

    return session[username];
  }

  // Get /api/user?limit=10&offset=20
  @Get()
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.usersService.findAll(paginationQueryDto);
  }

  // Delete /api/user/username
  @Delete('username')
  remove(@Param('username') username: string) {
    return this.usersService.remove(username);
  }

  // // Patch /api/users/:username
  // @Patch(':username')
  // update(
  //   @Param('username') username: string,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return this.usersService.update(username, updateUserDto);
  // }
}
