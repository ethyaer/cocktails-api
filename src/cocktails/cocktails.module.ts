import { Module } from '@nestjs/common';
import { CocktailsService } from './cocktails.service';
import { CocktailsController } from './cocktails.controller';
import { CocktailGeneralView } from '../entities/views/cocktail-general.view';
import { CocktailDetailsView } from '../entities/views/cocktail-detail.view';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Cocktail } from '../entities/cocktail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    CocktailGeneralView,
    CocktailDetailsView,
    Cocktail,
    User,
    Role
  ])],
  providers: [CocktailsService],
  controllers: [CocktailsController]
})
export class CocktailsModule {}
