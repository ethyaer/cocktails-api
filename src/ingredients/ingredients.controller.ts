import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { Ingredient } from '../entities/ingredient.entity';
import { CreateIngredientDto } from './DTOs/create-ingredient.dto';
import { Body, Post } from '@nestjs/common';
import { UpdateIngredientDto } from './DTOs/update-ingredient.dto';

@Controller('ingredients')
export class IngredientsController {
    constructor(private readonly ingredientsService: IngredientsService) {}

    @Get()
    async getIngredients(): Promise<Ingredient[]> {
        return this.ingredientsService.getIngredients();
    }

    @Get(':id')
    async getIngredientById(
        @Param('id', ParseIntPipe) ingredientId: number
    ): Promise<Ingredient | null> {
        const ingredient = await this.ingredientsService.getIngredientById(ingredientId);
        if (!ingredient) {
            throw new NotFoundException(`Ingredient with ID ${ingredientId} not found`);
        }
        return ingredient;
    }

    @Get('filter')
    async getIngredientsByFilters(
        @Param('name') name?: string,
        @Param('containsAlcohol') containsAlcohol?: boolean
    ): Promise<Ingredient[]> {
        const filter: { name?: string; containsAlcohol?: boolean } = {};
        if (name) filter.name = name;
        if (containsAlcohol !== undefined) filter.containsAlcohol = containsAlcohol;
        return this.ingredientsService.getIngredientsByFilters(filter);
    }

    @Post()
    async createIngredient(@Body() createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
        return this.ingredientsService.createIngredient(createIngredientDto);
    }

    @Post(':ingredientId')
    async updateIngredient(
        @Param('ingredientId', ParseIntPipe) ingredientId: number,
        @Body() updateIngredientDto: UpdateIngredientDto
    ): Promise<Ingredient | null> {
        return this.ingredientsService.updateIngredient(ingredientId, updateIngredientDto);
    }
}
