import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { encryptText } from 'src/utils/crypto';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(username: User['username']) {
    const user = await this.userRepository.findOne({
      where: { username },
    });
    return user;
  }

  async isExist(username: User['username']) {
    const user = await this.findOne(username);
    return user !== null;
  }

  findAll({ offset, limit }: PaginationQueryDto) {
    return this.userRepository.find({
      // relations: ['flavors'],
      // 分页查询
      skip: offset, // 跳过 offset 个记录
      take: limit, // 获取 limit 个记录
    });
  }

  async create(createUserDto: User) {
    // 对密码进行加密处理
    const encryptedPassword = encryptText(createUserDto.password);
    // console.log(encryptedPassword);
    // console.log(decryptText(encryptedPassword));
    const user = this.userRepository.create({
      ...createUserDto,
      password: encryptedPassword,
    });
    return this.userRepository.save(user);
  }

  async update(username: string, updateUserDto: UpdateUserDto) {
    // 通过 Repository.preload() 方法创建一个实体的实例，该实体会综合数据库中的已有记录及传入的更新数据
    const user = await this.userRepository.preload({
      username: username, // 必须指定 id，用于检索对应的记录
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`User #${username} not found`);
    }
    // 将新的实体实例保存到数据库中
    return this.userRepository.save(user);
  }

  async remove(username: User['username']) {
    const user = await this.findOne(username);
    // 通过 Repository.remove() 方法从数据库中删除实体对应的记录
    return this.userRepository.remove(user);
  }
}
