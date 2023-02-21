import { Optional } from '@nestjs/common';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Meeting {
  @PrimaryColumn({ comment: '随机的会议号' })
  id: string; // 随机的会议号，作为主键

  @Column({ comment: '会议名' })
  name: string; // 会议名

  @Column({ comment: '会议密码' })
  @Optional()
  password: string; // 可选的密码

  @Column({ comment: '会议人数' })
  size: number; // 人数

  @Column('datetime', { comment: '会议开始时间' })
  start_time: string; // 开始时间

  @Column('datetime', { nullable: true, comment: '会议结束时间' })
  end_time: string; // 结束时间

  /**
   * 主持关系：一对多/多对一
   * 一个会议只有一个主持人
   * 一个用户可以主持多个会议
   */
  @ManyToOne(() => User, (user) => user.chaired_meetings, {
    // 设置外键约束
    onDelete: 'CASCADE', // 级联删除
    onUpdate: 'CASCADE', // 级联更新
  })
  @JoinColumn({
    name: 'host_username', // 字段名
    referencedColumnName: 'username', // 引用的外键字段
    foreignKeyConstraintName: 'host_username_constraint', // 外键约束的名称
  })
  host: User; // 主持人

  /**
   * 参会关系：多对多
   * 一个会议有多个用户参与
   * 一个用户可以参与多个会议
   */
  @ManyToMany(() => User, (user) => user.attended_meetings, {
    // 设置外键约束
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  attendees: User[]; // 参会人
}
