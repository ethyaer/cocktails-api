import { Module } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { Ingredient } from '../entities/ingredient.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Ingredient,
    User,
    CocktailIngredient
    ])],
  providers: [IngredientsService],
  controllers: [IngredientsController],
  exports: [IngredientsService]
})
export class IngredientsModule {}
