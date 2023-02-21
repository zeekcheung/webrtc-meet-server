import { Meeting } from 'src/modules/meeting/entities/meeting.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn({ comment: '用户名' })
  username: string;

  @Column({ comment: '用户昵称' })
  nickname: string;

  @Column({ comment: '用户密码' })
  password: string;

  @Column('datetime', { comment: '用户注册时间' })
  register_time: string;

  /**
   * 主持关系：一对多/多对一
   * 一个会议只有一个主持人
   * 一个用户可以主持多个会议
   */
  @OneToMany(() => Meeting, (meeting) => meeting.host)
  chaired_meetings: Meeting[];

  /**
   * 参会关系：多对多
   * 一个会议有多个用户参与
   * 一个用户可以参与多个会议
   */
  @ManyToMany(() => Meeting, (meeting) => meeting.attendees, {
    // 设置外键约束
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  // 配置联结表
  @JoinTable({
    name: 'user_attend_meeting',
    joinColumn: {
      name: 'username',
      referencedColumnName: 'username',
      foreignKeyConstraintName: 'username_constraint',
    },
    inverseJoinColumn: {
      name: 'meeting_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'meeting_id_constraint',
    },
  })
  attended_meetings: Meeting[];
}
