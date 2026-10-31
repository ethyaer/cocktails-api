import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Cocktail } from './cocktail.entity';
import { Ingredient } from './ingredient.entity';

@Entity({ name: 'cocktail_ingredients', schema: 'public' })
export class CocktailIngredient {
  @PrimaryGeneratedColumn({ name: 'ci_id', type: 'integer' })
  cocktailIngredientId: number;

   @Column({ name: 'cocktail_id', type: 'integer', nullable: false })
  cocktailId: number;

  @Column({ name: 'ingredient_id', type: 'integer', nullable: false })
  ingredientId: number;

  @Column({ name: 'amount', type: 'integer', nullable: false })
  amount: number;

  @ManyToOne(() => Cocktail, cocktail => cocktail.cocktailIngredients)
  @JoinColumn({ name: 'cocktail_id', referencedColumnName: 'cocktailId' })
    cocktail: Cocktail;

  @ManyToOne(() => Ingredient, ingredient => ingredient.cocktailIngredients)
  @JoinColumn({ name: 'ingredient_id', referencedColumnName: 'ingredientId' })
    ingredient: Ingredient;
}