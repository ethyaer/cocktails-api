
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { CocktailIngredient } from './cocktail-ingredient.entity';
import { User } from './user.entity';

@Entity({ name: 'ingredients', schema: 'public' })
export class Ingredient {
  @PrimaryGeneratedColumn({ name: 'ingredient_id', type: 'integer' })
  ingredientId: number;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'photourl', type: 'text', nullable: true })
  photoUrl: string | null;

  @Column({ name: 'contains_alcohol', type: 'boolean', nullable: true })
  containsAlcohol: boolean | null;

  @Column({ name: 'creator_id', type: 'integer'})
  creatorId: number;

  @ManyToOne(() => User, user => user.userId)
  @JoinColumn({ name: 'creator_id', referencedColumnName: 'userId'})
    creator: User;


  @OneToMany(() => CocktailIngredient, ci => ci.ingredient)
  cocktailIngredients: CocktailIngredient[];
}
