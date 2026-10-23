import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CocktailGeneralView } from '../entities/views/cocktail-general.view';
import { CocktailDetailsView } from '../entities/views/cocktail-detail.view';

@Injectable()
export class CocktailsService {
    constructor(
        @InjectRepository(CocktailGeneralView)
        private readonly cocktailGeneralViewRepository: Repository<CocktailGeneralView>,

        @InjectRepository(CocktailDetailsView)
        private readonly cocktailDetailsViewRepository: Repository<CocktailDetailsView>
    ) {}

    async getCocktails(): Promise<CocktailGeneralView[]> {
        return this.cocktailGeneralViewRepository.find();
    }

    async getCocktailById(cocktailId: number): Promise<CocktailDetailsView | null> {
        return this.cocktailDetailsViewRepository.findOne({ where: { cocktailId } });
    }
}
