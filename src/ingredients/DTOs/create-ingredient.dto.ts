import {IsBoolean, IsNotEmpty, IsString, IsOptional, IsInt} from "class-validator";

export class CreateIngredientDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    @IsString()
    photoUrl?: string;

    @IsBoolean()
    @IsOptional()
    containsAlcohol?: boolean;
}
