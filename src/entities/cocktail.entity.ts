
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';
import { CocktailIngredient } from './cocktail-ingredient.entity';
import { Review } from './review.entity';

@Entity({ name: 'cocktails', schema: 'public' })
export class Cocktail {
  @PrimaryGeneratedColumn({ name: 'cocktail_id', type: 'integer' })
  cocktailId: number;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'category_id', type: 'integer' })
  categoryId: number;

  @Column({ name: 'recipe', type: 'text', nullable: true })
  recipe: string | null;

  @Column({ name: 'photourl', type: 'text', nullable: true })
  photoUrl: string | null;

  @Column({ name: 'creator_id', type: 'integer' })
  creatorId: number;

  @ManyToOne(() => Category, category => category.cocktails)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'categoryId' })
  category: Category;

  @ManyToOne(() => User, user => user.createdCocktails)
  @JoinColumn({ name: 'creator_id', referencedColumnName: 'userId' })
  creator: User;

  @OneToMany(() => CocktailIngredient, ci => ci.cocktail)
  cocktailIngredients: CocktailIngredient[];

  @OneToMany(() => Review, review => review.cocktail)
  reviews: Review[];
}
