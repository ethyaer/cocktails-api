import { Type } from 'class-transformer';
import {IsString, IsOptional, IsNumber, Min, IsNotEmpty, IsPositive, IsInt, IsArray, ValidateNested} from 'class-validator';

export class CreateCocktailDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    photoUrl?: string;

    @IsNumber()
    @Min(1)
    categoryId: number;

    @IsNumber({}, { each: true })
    @IsOptional()
    ingredientIds?: number[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CocktailIngredientDTO)
    ingredients?: CocktailIngredientDTO[];
}

export class CocktailIngredientDTO {
    @IsInt()
    @IsPositive()
    ingredientId: number;

    @IsInt()
    @IsNotEmpty()
    amount: number;
}

