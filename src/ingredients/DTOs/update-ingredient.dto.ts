import {IsBoolean, IsNotEmpty, IsString, IsOptional} from "class-validator";

export class UpdateIngredientDto {
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
