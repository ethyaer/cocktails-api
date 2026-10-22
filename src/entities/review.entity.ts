import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Cocktail } from './cocktail.entity';
import { User } from './user.entity';

@Entity({ name: 'reviews', schema: 'public' })
export class Review {
  @PrimaryGeneratedColumn({ name: 'review_id', type: 'integer' })
  reviewId: number;
  
    @Column({ name: 'cocktail_id', type: 'integer', nullable: false })
    cocktailId: number;

    @Column({ name: 'user_id', type: 'integer', nullable: false })
    userId: number;

    @Column({ name: 'rating', type: 'integer', nullable: false })
    rating: number;

    @Column({ name: 'comment', type: 'text', nullable: true })
    comment: string | null;

    @ManyToOne(() => Cocktail, cocktail => cocktail.reviews)
    @JoinColumn({ name: 'cocktail_id', referencedColumnName: 'cocktailId' })
    cocktail: Cocktail;
    @ManyToOne(() => User, user => user.reviews)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
    user: User;
}