import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import { Review } from './review.entity';
import { Cocktail } from './cocktail.entity';
import { Role } from './role.entity';
import { Ingredient } from './ingredient.entity';

@Entity({ name: 'users', schema: 'public' })
export class User {
    static findOne(arg0: { where: { login: string; }; }) {
        throw new Error('Method not implemented.');
    }
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'integer' })
  userId: number;

    @Column({ name: 'name', type: 'varchar', unique: true })
    name: string;

    @Column({ name: 'login', type: 'varchar' })
    login: string;

    @Column({ name: 'password_hash', type: 'varchar' })
    passwordHash: string;

    @Column({ name: 'role_id', type: 'integer' })
    roleId: number;

    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({ name: 'role_id', referencedColumnName: 'roleId' })
    role: Role;

    @OneToMany(() => Cocktail, cocktail => cocktail.creator)
    createdCocktails: Cocktail[];

    @OneToMany(() => Review, review => review.user)
    reviews: Review[];

    @OneToMany(() => Ingredient, ingredient => ingredient.creator)
    ingredients: Ingredient[];
}
