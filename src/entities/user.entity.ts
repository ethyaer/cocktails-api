import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import { Review } from './review.entity';
import { Cocktail } from './cocktail.entity';
import { Role } from './role.entity';

@Entity({ name: 'users', schema: 'public' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'integer' })
  userId: number;

    @Column({ name: 'name', type: 'varchar', unique: true })
    name: string;

    @Column({ name: 'login', type: 'varchar' })
    login: string;

    @Column({ name: 'email', type: 'varchar', unique: true })
    email: string;

    @Column({ name: 'password', type: 'varchar' })
    password: string;

    @Column({ name: 'role_id', type: 'integer' })
    roleId: number;

    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({ name: 'role_id', referencedColumnName: 'roleId' })
    role: Role;

    @OneToMany(() => Cocktail, cocktail => cocktail.creator)
    createdCocktails: Cocktail[];

    @OneToMany(() => Review, review => review.user)
    reviews: Review[];
}
