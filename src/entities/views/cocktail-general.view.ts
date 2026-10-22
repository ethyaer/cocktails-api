import {ViewEntity, ViewColumn} from "typeorm";

@ViewEntity({ name: "v_cocktail_general",  schema: "public" })
export class CocktailGeneralView {
    @ViewColumn({ name: "cocktail_id" })
    cocktailId: number;

    @ViewColumn({ name: "name" })
    name: string;

    @ViewColumn({ name: "photo_url" })
    photoUrl: string;

    @ViewColumn({ name: "category_name" })
    categoryName: string;

    @ViewColumn({ name: "creator_name" })
    creatorName: string;

    @ViewColumn({ name: "average_rating" })
    averageRating: string;
}