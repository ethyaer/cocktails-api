
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CocktailIngredient } from './cocktail-ingredient.entity';

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

  @OneToMany(() => CocktailIngredient, ci => ci.ingredient)
  cocktailIngredients: CocktailIngredient[];
}
