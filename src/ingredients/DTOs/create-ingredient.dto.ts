import {IsBoolean, IsNotEmpty, IsString, IsOptional} from "class-validator";

export class CreateIngredientDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    @IsOptional()
    description?: string;

    @IsOptional()
    @IsString()
    photoUrl?: string;

    @IsBoolean()
    @IsOptional()
    containsAlcohol?: boolean;
}
