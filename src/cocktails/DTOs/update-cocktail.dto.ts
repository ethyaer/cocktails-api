import {IsString, IsOptional, IsNumber, Min, IsNotEmpty, IsInt, IsPositive, IsArray, ValidateNested} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCocktailDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    recipe?: string;

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