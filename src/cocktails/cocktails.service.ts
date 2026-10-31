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
import { PaginationUtil } from '../pagination/pagination.util';

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

    /*async getCocktails() {
        return this.cocktailGeneralViewRepository.find();
    }*/

    async getCocktails(page = 1, pageSize = 10) {
        const pag = new PaginationUtil();
        pag.setPageSize(pageSize);

        const rowsNum =  await this.cocktailDetailsViewRepository.count();
        const {offset, limit, currentPage, totalPages} = pag.getPagination(page, rowsNum);

        const [cocktails, totalItems] = await this.cocktailDetailsViewRepository.findAndCount({skip: offset, take: limit});

        return { 
            data: cocktails,
            pagination: pag.getPagination(page, rowsNum)
        };
    }

    async getCocktailById(cocktailId: number): Promise<CocktailDetailsView | null> {
        return this.cocktailDetailsViewRepository.findOne({ where: { cocktailId } });
    }

    async getSortedCocktails(sortBy: string, order: string, page = 1, pageSize = 10) {
        const queryBuilder = this.cocktailGeneralViewRepository.createQueryBuilder('cocktail');

        const sortingFields = ['name', 'ingredientId', 'containsAlcohol'];
        const orders = ['ASC', 'DESC'];

        if(sortingFields.includes(sortBy) && orders.includes(order))
            if(order = 'ASC')
                queryBuilder.orderBy(`cocktail.${sortBy}`, 'ASC');
            else
                queryBuilder.orderBy(`cocktail.${sortBy}`, 'DESC');

        //pagination
        const pag = new PaginationUtil();
        pag.setPageSize(pageSize);

        const rowsNum = await this.cocktailGeneralViewRepository.count();
        const {offset, limit} = pag.getPagination(page, rowsNum);

        const cocktails = await queryBuilder.skip(offset).take(limit).getMany();

        return {
            data: cocktails,
            pagination: pag.getPagination(page, rowsNum)
        }
    }

    async getCocktailsByFilters(filter:  
        {
            name?: string, 
            categoryName?: string[], 
            minRating?: number, 
            maxRating?: number, 
            ingredients?: string[]
        }, page = 1, pageSize = 10) 
    {
        //filters
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

        //pagination
        const pag = new PaginationUtil();
        pag.setPageSize(pageSize);

        const rowsNum =  await queryBuilder.getCount();
        const {offset, limit} = pag.getPagination(page, rowsNum);

        const cocktails = await queryBuilder.skip(offset).take(limit).getMany();

        return {
            data: cocktails,
            pagination: pag.getPagination(page, rowsNum)
        }
    }

    async createCocktail(cocktailData: CreateCocktailDto, creatorId: number): Promise<CocktailDetailsView> {
        return this.dataSource.transaction(async (manager) => {
            const { ingredients, ...cocktailFields } = cocktailData;

            const doesCocktailExists = await manager.createQueryBuilder(Cocktail, 'cocktail')
                .where('cocktail.name = :name', {name : cocktailFields.name}).getOne();
            if(doesCocktailExists)
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
                const doesCocktailNameExists = await manager.createQueryBuilder(Cocktail, 'cocktail')
                    .where('cocktail.name = :name', {name : cocktailFields.name})
                    .andWhere('cocktail.cocktailId != :cocktailId', {cocktailId}).getOne();
                if(doesCocktailNameExists)
                    throw new ConflictException('Cocktail with that name already exists');
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
