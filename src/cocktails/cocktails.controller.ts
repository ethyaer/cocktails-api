import { Controller, Get, Param, ParseIntPipe, NotFoundException, Delete, Req, Query, DefaultValuePipe } from '@nestjs/common';
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
    async getCocktails(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, 
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number
    ) {
        return this.cocktailsService.getCocktails(page, pageSize);
    }

    @Get(':cocktailId')
    async getCocktailById(@Param('cocktailId', ParseIntPipe) cocktailId: number): Promise<CocktailDetailsView | null> {
        const cocktail = await this.cocktailsService.getCocktailById(cocktailId);
        if (cocktail === null)
            throw new NotFoundException(`Cannot find cocktail with id ${cocktailId}`);
        else
            return cocktail;
    }

    @Get()
    async getSortedCocktails(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, 
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
        @Query('sortBy') sortBy: string,
        @Query('order') order: string
    ) {
        return this.cocktailsService.getSortedCocktails(sortBy, order, page, pageSize);
    }

    @Get('filter')
    async getCocktailsByFilters(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
        @Query('name') name?: string,
        @Query('categoryName') categoryName?: string[],
        @Query('minRating') minRating?: number,
        @Query('maxRating') maxRating?: number,
        @Query('ingredients') ingredients?: string[],
    ) {
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

        return this.cocktailsService.getCocktailsByFilters(filter, page, pageSize);
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
