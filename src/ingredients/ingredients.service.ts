import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity';
import { CreateIngredientDto } from './DTOs/create-ingredient.dto';
import { UpdateIngredientDto } from './DTOs/update-ingredient.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class IngredientsService {
    constructor(
        @InjectRepository(Ingredient)
        private readonly ingredientRepository: Repository<Ingredient>
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

    async createIngredient(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
        const newIngredient = this.ingredientRepository.create(createIngredientDto);
        return this.ingredientRepository.save(newIngredient);
    }

    async updateIngredient(ingredientId: number, updateIngredientDto: UpdateIngredientDto): Promise<Ingredient | null> {
        const ingredient = await this.ingredientRepository.findOne({ where: { ingredientId } });

        if (!ingredient) {
            throw new NotFoundException(`Ingredient with ID ${ingredientId} not found`);
        }   

        Object.assign(ingredient, updateIngredientDto);
        return this.ingredientRepository.save(ingredient);
    }
}
