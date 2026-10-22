import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cocktail } from './cocktail.entity';

@Entity({ name: 'categories', schema: 'public' })
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id', type: 'integer' })
  categoryId: number;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @OneToMany(() => Cocktail, cocktail => cocktail.category)
  cocktails: Cocktail[];
}