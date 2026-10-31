import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity';
import { CreateIngredientDto } from './DTOs/create-ingredient.dto';
import { UpdateIngredientDto } from './DTOs/update-ingredient.dto';
import { NotFoundException } from '@nestjs/common';
import { PaginationUtil } from '../pagination/pagination.util';
import { skip } from 'node:test';
import { User } from '../entities/user.entity';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';

@Injectable()
export class IngredientsService {
    constructor(
        @InjectRepository(Ingredient)
        private readonly ingredientRepository: Repository<Ingredient>,

        private readonly dataSource: DataSource

    ) {}

    /*async getIngredients(): Promise<Ingredient[]> {
        return this.ingredientRepository.find();
    }*/

    async getIngredients(page = 1, pageSize = 10) {
        const pag = new PaginationUtil();
        pag.setPageSize(pageSize);

        const rowsNum = await this.ingredientRepository.count();
        const {offset, limit} = pag.getPagination(page, rowsNum);

        const ingredients = await this.ingredientRepository.findAndCount({skip: offset, take: limit});

        return {data: ingredients, pagination: pag.getPagination(page, rowsNum)};
    }

    async getIngredientById(ingredientId: number) : Promise<Ingredient | null> {
        return this.ingredientRepository.findOne({ where: { ingredientId } });
    }

    async getSortedIngredients(sortBy: string, order: string, page = 1, pageSize = 10) {
        const queryBuilder = this.ingredientRepository.createQueryBuilder('ingredient');

        const sortingFields = ['name', 'ingredientId', 'containsAlcohol'];
        const orders = ['ASC', 'DESC'];

        if(sortingFields.includes(sortBy) && orders.includes(order))
            if(order = 'ASC')
                queryBuilder.orderBy(`ingredient.${sortBy}`, 'ASC');
            else
                queryBuilder.orderBy(`ingredient.${sortBy}`, 'DESC');

        //if(sortingFields.includes(sortBy))
          //  queryBuilder.orderBy(`ingredient.${sortBy}`, 'ASC');

        //pagination
        const pag = new PaginationUtil();
        pag.setPageSize(pageSize);

        const rowsNum = await this.ingredientRepository.count();
        const {offset, limit} = pag.getPagination(page, rowsNum);

        const ingredients = await queryBuilder.skip(offset).take(limit).getMany();

        return {
            data: ingredients,
            pagination: pag.getPagination(page, rowsNum)
        }
    }

    async getIngredientsByFilters(filter: { name?: string, containsAlcohol?: boolean }, page = 1, pageSize = 10) {
        const queryBuilder = this.ingredientRepository.createQueryBuilder('ingredient');

        if (filter.name) {
            queryBuilder.andWhere('ingredient.name ILIKE :name', { name: `%${filter.name}%` });
        }

        if (filter.containsAlcohol !== undefined) {
            queryBuilder.andWhere('ingredient.containsAlcohol = :containsAlcohol', { containsAlcohol: filter.containsAlcohol });
        }

        //pagination
        const pag = new PaginationUtil();
        pag.setPageSize(pageSize);

        const rowsNum = await this.ingredientRepository.count();
        const {offset, limit} = pag.getPagination(page, rowsNum);

        const ingredients = await queryBuilder.skip(offset).take(limit).getMany();

        return {
            data: ingredients,
            pagination: pag.getPagination(page, rowsNum)
        }
    }

    async createIngredient(ingredientData: CreateIngredientDto, creatorId: number) : Promise<Ingredient> {
        return this.dataSource.transaction(async(manager) => {
            const doesIngredientExists = await manager.createQueryBuilder(Ingredient, 'ingredient')
                .where('ingredient.name = :name', {name: ingredientData.name}).getOne();
            if(doesIngredientExists)
                throw new ConflictException('Ingredient with that name already exists');

            const newIngredient = manager.create(Ingredient, {...ingredientData, creatorId});
            const savedIngredient = await manager.save(Ingredient, newIngredient);

            const ingredient = await manager.getRepository(Ingredient).findOne({
                where: {ingredientId: savedIngredient.ingredientId}
            });
            if(!ingredient)
                throw new NotFoundException('Ingredient not found');

            return ingredient;
        });
    }

    async updateIngredient(ingredientId: number, ingredientData: UpdateIngredientDto, userId: number) : Promise<Ingredient | null> {
        return this.dataSource.transaction(async(manager) => {
            const ingredient = await manager.findOne(Ingredient, {where: {ingredientId}});
            if(!ingredient)
                throw new NotFoundException(`Ingredient with ID ${ingredientId} not found`);

            if(ingredient.creatorId !== userId)
                throw new ForbiddenException('You are not the creator of this ingredient');

            if(ingredientData.name !== undefined) {
                const doesIngredientNameExists = await manager.createQueryBuilder(Ingredient, 'ingredient')
                    .where('ingredient.name = :name', { name: ingredientData.name})
                    .andWhere('ingredient.ingredient_id != :ingredientId', {ingredientId: ingredientId})
                    .getOne();
                if(doesIngredientNameExists)
                    throw new ConflictException('Cocktail with this name already exists')
            }

            manager.merge(Ingredient, ingredient, ingredientData);
            await manager.save(Ingredient, ingredient);

            return manager.getRepository(Ingredient).findOne({where: {ingredientId}});
        });
    }

    async deleteIngredient(ingredientId: number, userId: number) : Promise<void>{
        return this.dataSource.transaction(async manager => {
            const ingredient = await manager.findOne(Ingredient, {where: {ingredientId}});
            if(!ingredient)
                throw new NotFoundException('Ingredient not found');

            const userRoleId = await manager.createQueryBuilder(User, 'user')
                             .innerJoin('user.role', 'role')
                             .where('user.userId = :userId', {userId})
                             .select('role.roleId', 'roleId')
                             .getRawOne();

            if(ingredient.creatorId !== userId && userRoleId?.roleId === 1) {
                throw new ForbiddenException('You are not the owner of this cocktail or an administrator');
            }
            
            const isUsed = await manager.findOne(CocktailIngredient, {where: {ingredientId}});
            if(isUsed)
                throw new ForbiddenException('This ingredient is related with some cocktails so it cannot be deleted');

            await manager.remove(Ingredient, ingredient);
        });
    }
}
