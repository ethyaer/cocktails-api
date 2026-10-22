import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'roles', schema: 'public' })
export class Role {
  @PrimaryGeneratedColumn({ name: 'role_id', type: 'integer' })
  roleId: number;

    @Column({ name: 'name', type: 'varchar' })
    name: string;
    @OneToMany(() => User, user => user.role)
    users: User[];

}