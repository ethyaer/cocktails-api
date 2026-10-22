
import { ViewEntity, ViewColumn } from 'typeorm';

export interface CocktailViewIngredient {
  ingredient_id: number;
  name: string;
  description: string | null;
  photourl: string | null;
  contains_alcohol: boolean | null;
  amount: number;
}

export interface CocktailViewReview {
  review_id: number;
  user_id: number | null;
  user_name: string | null;
  text: string | null;
  note: number;
}

@ViewEntity({ name: 'v_cocktail_details', schema: 'public' })
export class CocktailDetailsView {
  @ViewColumn({ name: 'cocktail_id' })
  cocktailId: number | null;

  @ViewColumn({ name: 'name' })
  name: string | null;

  @ViewColumn({ name: 'photourl' })
  photoUrl: string | null;

  @ViewColumn({ name: 'recipe' })
  recipe: string | null;

  @ViewColumn({ name: 'category_name' })
  categoryName: string | null;

  @ViewColumn({ name: 'creator_name' })
  creatorName: string | null;

  @ViewColumn({ name: 'average_rating' })
  averageRating: string | null;

  @ViewColumn({ name: 'ingredients' })
  ingredients: CocktailViewIngredient[] | null;

  @ViewColumn({ name: 'reviews' })
  reviews: CocktailViewReview[] | null;
}
