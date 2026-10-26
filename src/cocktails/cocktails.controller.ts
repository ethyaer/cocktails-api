import { Controller, Get, Param, ParseIntPipe, NotFoundException, Delete, Req } from '@nestjs/common';
import { CocktailsService } from './cocktails.service';
import { CocktailGeneralView } from '../entities/views/cocktail-general.view';
import { CocktailDetailsView } from '../entities/views/cocktail-detail.view';

import { CreateCocktailDto } from './DTOs/create-cocktail.dto';
import { UpdateCocktailDto } from './DTOs/update-cocktail.dto';
import { Body, Post, Request, Patch } from '@nestjs/common';

import { ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Controller('cocktails')
export class CocktailsController {
    constructor(private readonly cocktailsService: CocktailsService) {}

    @Get()
    async getCocktails(): Promise<CocktailGeneralView[]> {
        return this.cocktailsService.getCocktails();
    }

    @Get(':cocktailId')
    async getCocktailById(@Param('cocktailId', ParseIntPipe) cocktailId: number): Promise<CocktailDetailsView | null> {
        const cocktail = await this.cocktailsService.getCocktailById(cocktailId);
        if (cocktail === null)
            throw new NotFoundException(`Cannot find cocktail with id ${cocktailId}`);
        else
            return cocktail;
    }

    @Get('filter')
    async getCocktailsByFilters(
        @Param('name') name?: string,
        @Param('categoryName') categoryName?: string[],
        @Param('minRating') minRating?: number,
        @Param('maxRating') maxRating?: number,
        @Param('ingredients') ingredients?: string[]
    ): Promise<CocktailGeneralView[]> {
        const filter: {
            name?: string,
            categoryName?: string[],
            minRating?: number,
            maxRating?: number,
            ingredients?: string[]
        } = {};

        if (name) filter.name = name;
        if (categoryName) filter.categoryName = categoryName;
        if (minRating !== undefined) filter.minRating = minRating;
        if (maxRating !== undefined) filter.maxRating = maxRating;
        if (ingredients) filter.ingredients = ingredients;

        return this.cocktailsService.getCocktailsByFilters(filter);
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async createCocktail(@Body() cocktailData: CreateCocktailDto, @Request() req: { user: { userId: number } }): Promise<CocktailDetailsView> {
        return this.cocktailsService.createCocktail(cocktailData, req.user.userId);
    }

    @Patch(':cocktailId')
    @UseGuards(AuthGuard('jwt'))
    async updateCocktail(
        @Param('cocktailId', ParseIntPipe) cocktailId: number,
        @Body() updateCocktailDto: UpdateCocktailDto,
        @Request() req: {user: {userId: number}}
    ): Promise<CocktailDetailsView | null> {
        return this.cocktailsService.updateCocktail(cocktailId, req.user.userId, updateCocktailDto);
    }

    @Delete(':cocktailId')
    @UseGuards(AuthGuard('jwt'))
    async deleteCocktail(
        @Param('cocktailId', ParseIntPipe) cocktailId: number,
        @Request() req: { user: { userId: number } }
    ): Promise<void> {
        return this.cocktailsService.deleteCocktail(cocktailId, req.user.userId);
    }

}
