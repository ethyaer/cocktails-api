import {IsBoolean, IsNotEmpty, IsString, IsOptional, IsInt, Min, Max} from "class-validator";

export class UpdateReviewDTO {
    @IsInt()
    @IsNotEmpty()
    cocktailId: number;

    //@IsInt()
    //@IsNotEmpty()
    //userId: number;

    @IsInt() 
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    note: number;

    @IsString()
    @IsOptional()
    text?: string;
}

