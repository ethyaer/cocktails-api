import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity';
import { CreateIngredientDto } from './DTOs/create-ingredient.dto';
import { UpdateIngredientDto } from './DTOs/update-ingredient.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class IngredientsService {
    constructor(
        @InjectRepository(Ingredient)
        private readonly ingredientRepository: Repository<Ingredient>,

        private readonly dataSource: DataSource

    ) {}

    async getIngredients(): Promise<Ingredient[]> {
        return this.ingredientRepository.find();
    }

    async getIngredientById(ingredientId: number): Promise<Ingredient | null> {
        return this.ingredientRepository.findOne({ where: { ingredientId } });
    }

    async getIngredientsByFilters(filter: { name?: string, containsAlcohol?: boolean }): Promise<Ingredient[]> {
        const queryBuilder = this.ingredientRepository.createQueryBuilder('ingredient');

        if (filter.name) {
            queryBuilder.andWhere('ingredient.name ILIKE :name', { name: `%${filter.name}%` });
        }

        if (filter.containsAlcohol !== undefined) {
            queryBuilder.andWhere('ingredient.containsAlcohol = :containsAlcohol', { containsAlcohol: filter.containsAlcohol });
        }

        return queryBuilder.getMany();
    }

    async createIngredient(ingredientData: CreateIngredientDto, creatorId: number): Promise<Ingredient> {
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

    async updateIngredient(ingredientId: number, ingredientData: UpdateIngredientDto, userId: number): Promise<Ingredient | null> {
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

    //There's no logic for deleting ingredients 'cause they could be a part of some cocktails.
    //Deleting an ingredient would force the erasing of some cocktails they use it and that's not what we actually want.
    //Past added ingredients even when not used can be in the future useful for creating another recipes. 
}
