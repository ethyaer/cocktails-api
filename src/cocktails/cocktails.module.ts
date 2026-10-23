import { Module } from '@nestjs/common';
import { CocktailsService } from './cocktails.service';
import { CocktailsController } from './cocktails.controller';
import { CocktailGeneralView } from '../entities/views/cocktail-general.view';
import { CocktailDetailsView } from '../entities/views/cocktail-detail.view';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([
    CocktailGeneralView,
    CocktailDetailsView
  ])],
  providers: [CocktailsService],
  controllers: [CocktailsController]
})
export class CocktailsModule {}
