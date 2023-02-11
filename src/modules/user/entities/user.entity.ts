import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  username: string;

  @Column()
  nickname: string;

  @Column()
  password: string;

  @Column('datetime')
  register_time: string;
}
