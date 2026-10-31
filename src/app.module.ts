
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

//views import
import { CocktailDetailsView } from './entities/views/cocktail-detail.view';
import { CocktailGeneralView } from './entities/views/cocktail-general.view';
import { UserView } from './entities/views/user.view';

//entities import
import { Cocktail } from './entities/cocktail.entity';
import { Ingredient } from './entities/ingredient.entity';
import { CocktailIngredient } from './entities/cocktail-ingredient.entity';
import { User } from './entities/user.entity';
import { Category } from './entities/category.entity';
import { Role } from './entities/role.entity';
import { Review } from './entities/review.entity';

//modules import
import { CocktailsModule } from './cocktails/cocktails.module';
import { AuthModule } from './auth/auth.module';

//jwt import
import { JwtModule } from '@nestjs/jwt';
import { IngredientsModule } from './ingredients/ingredients.module';
import { ReviewsModule } from './reviews/reviews.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forFeature([
      Cocktail,
      Ingredient,
      CocktailIngredient,
      User,
      Category,
      Role,
      Review,

      CocktailDetailsView,
      CocktailGeneralView,
      UserView,

    ]),

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    CocktailsModule,
    AuthModule,
    IngredientsModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
