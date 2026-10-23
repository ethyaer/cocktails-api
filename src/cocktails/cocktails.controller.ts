import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { CocktailsService } from './cocktails.service';
import { CocktailGeneralView } from '../entities/views/cocktail-general.view';
import { CocktailDetailsView } from '../entities/views/cocktail-detail.view';

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
}
