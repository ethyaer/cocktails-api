import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CocktailGeneralView } from '../entities/views/cocktail-general.view';
import { CocktailDetailsView } from '../entities/views/cocktail-detail.view';
import { CreateCocktailDto } from './DTOs/create-cocktail.dto';
import { UpdateCocktailDto } from './DTOs/update-cocktail.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Cocktail } from '../entities/cocktail.entity';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';
import { DataSource } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class CocktailsService {
    constructor(
        @InjectRepository(CocktailGeneralView)
        private readonly cocktailGeneralViewRepository: Repository<CocktailGeneralView>,

        @InjectRepository(CocktailDetailsView)
        private readonly cocktailDetailsViewRepository: Repository<CocktailDetailsView>,

        @InjectRepository(Cocktail)
        private readonly cocktailRepository: Repository<Cocktail>,

        private readonly dataSource: DataSource
    ) {}

    async getCocktails(): Promise<CocktailGeneralView[]> {
        return this.cocktailGeneralViewRepository.find();
    }

    async getCocktailById(cocktailId: number): Promise<CocktailDetailsView | null> {
        return this.cocktailDetailsViewRepository.findOne({ where: { cocktailId } });
    }

    async getCocktailsByFilters(filter:  
        {
            name?: string, 
            categoryName?: string[], 
            minRating?: number, 
            maxRating?: number, 
            ingredients?: string[]
        }): Promise<CocktailGeneralView[]> 
    {
        const queryBuilder = this.cocktailGeneralViewRepository.createQueryBuilder('cocktail');

        if (filter.name) {
            queryBuilder.andWhere('cocktail.name ILIKE :name', { name: `%${filter.name}%` });
        }
        if (filter.categoryName) {
            queryBuilder.andWhere('cocktail.categoryName IN (:...categoryName)', { categoryName: filter.categoryName });
        }
        if (filter.minRating !== undefined) {
            queryBuilder.andWhere('cocktail.averageRating >= :minRating', { minRating: filter.minRating });
        }
        if (filter.maxRating !== undefined) {
            queryBuilder.andWhere('cocktail.averageRating <= :maxRating', { maxRating: filter.maxRating });
        }
        if (filter.ingredients?.length) {
            queryBuilder.andWhere('cocktail.ingredients @> :ingredients', { ingredients: filter.ingredients });
        }

        return queryBuilder.getMany();
    }

    async createCocktail(cocktailData: CreateCocktailDto, creatorId: number): Promise<CocktailDetailsView> {
        return this.dataSource.transaction(async (manager) => {
            const { ingredients, ...cocktailFields } = cocktailData;

            const doesCocktailExist = await manager.createQueryBuilder(Cocktail, 'cocktail')
                .where('cocktail.name = :name', {name : cocktailFields.name}).getOne();
            if(doesCocktailExist)
                throw new ConflictException('This cocktail already exist');

            
            const newCocktail = manager.create(Cocktail, {
                ...cocktailFields,
                creatorId,
            });

            const savedCocktail = await manager.save(Cocktail, newCocktail);

            const cocktailIngredients = (ingredients ?? []).map((item) =>
                manager.create(CocktailIngredient, {
                    cocktailId: savedCocktail.cocktailId,
                    ingredientId: item.ingredientId,
                    amount: item.amount,
                })
            );

            if (cocktailIngredients.length > 0)
                await manager.save(CocktailIngredient, cocktailIngredients);

            const cocktailDetails = await manager.getRepository(CocktailDetailsView).findOne( {
                where: { cocktailId: savedCocktail.cocktailId },
            });

            if (!cocktailDetails) 
                throw new NotFoundException(`Cocktail with ID ${savedCocktail.cocktailId} not found in details view`);

            return cocktailDetails;
        });
    }

    async updateCocktail(cocktailId: number, userId: number, cocktailData: UpdateCocktailDto) : Promise<CocktailDetailsView | null> {
        return this.dataSource.transaction(async (manager) => {
            //checking if cocktail exists
            const cocktail = await manager.findOne(Cocktail, { where: { cocktailId } });

            if (!cocktail)
                throw new NotFoundException(`Cocktail with ID ${cocktailId} not found`);

            //checking if logged user is the creator of updating cocktail
            if(cocktail.creatorId !== userId)
                throw new ForbiddenException('You are not the creator of this cocktail so you cannot make changes in it');

            const { ingredients, ...cocktailFields } = cocktailData;

            //checking the name of the cocktail
            if(cocktailFields.name !== undefined) {
                const doesCocktailNameExist = await manager.createQueryBuilder(Cocktail, 'cocktail')
                    .where('cocktail.name = :name', {name : cocktailFields.name})
                    .andWhere('cocktail.cocktailId != :cocktailId', {cocktailId}).getOne();
                if(doesCocktailNameExist)
                    throw new ConflictException('Cocktail with that name already exist');
            }

            manager.merge(Cocktail, cocktail, cocktailFields);
            const updatedCocktail = await manager.save(Cocktail, cocktail)

            //ingredients check
            if(ingredients !== undefined) {
                await manager.delete(CocktailIngredient, {cocktailId});

                const cocktailIngredients = (ingredients ?? []).map((item) =>
                    manager.create(CocktailIngredient, {
                        cocktailId: updatedCocktail.cocktailId,
                        ingredientId: item.ingredientId,
                        amount: item.amount,
                    })
                );

                if (cocktailIngredients.length > 0)
                    await manager.save(CocktailIngredient, cocktailIngredients);

            }

            return manager.getRepository(CocktailDetailsView).findOne({where:{cocktailId}});
        });
    }

    async deleteCocktail(cocktailId: number, userId: number): Promise<void> {
        return this.dataSource.transaction(async (manager) => {
            const cocktail = await manager.findOne(Cocktail, { where: { cocktailId } });
            
            const userRoleId = await manager.createQueryBuilder(User, 'user')
                .innerJoin('user.role', 'role')
                .where('user.userId = :userId', {userId})
                .select('role.roleId', 'roleId')
                .getRawOne();

            if (!cocktail) {
                throw new NotFoundException(`Cocktail with ID ${cocktailId} not found`);
            }
            

            if (cocktail.creatorId !== userId && userRoleId?.roleId === 1) {
                throw new ForbiddenException('You are not the owner of this cocktail or an administrator');
            }

            await manager.remove(Cocktail, cocktail);

            const cocktailIngredients = await manager.find(CocktailIngredient, {where: {cocktailId}});
            await manager.remove(CocktailIngredient, cocktailIngredients);
        });
    }
}
