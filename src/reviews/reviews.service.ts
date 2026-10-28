import { Injectable } from '@nestjs/common';
import { Review } from '../entities/review.entity';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { Repository, DataSource, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReviewDTO } from './DTOs/create-review.dto';
import { Cocktail } from '../entities/cocktail.entity';
import { User } from '../entities/user.entity';
import { UpdateReviewDTO } from './DTOs/update-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,

        private readonly dataSource: DataSource
    ) {}

    async getReviewsByCocktailId(cocktailId: number) {
        return this.reviewRepository.createQueryBuilder('review').innerJoin('review.user', 'user')
        .select([
            'review.review_id',
            'review.note',
            'review.user_id',
            'review.text',
            'review.cocktail_id',
            'user.name'
        ]).where('review.cocktail_id = :cocktailId', {cocktailId})
        .getRawMany();
    }

    async getReviewsByUserId(userId: number) {
        return this.reviewRepository.createQueryBuilder('review').innerJoin('review.user', 'user')
        .select([
            'review.review_id',
            'review.note',
            'review.user_id',
            'review.text',
            'review.cocktail_id',
            'user.name'
        ]).where('review.user_id = :userId', {userId})
        .getRawMany();
    }

    async createReview(cocktailId: number, userId: number, reviewData: CreateReviewDTO) {
        return this.dataSource.transaction(async manager => {
            //check if reviewing cocktail exists
            const doesCocktailExists = await manager.createQueryBuilder(Cocktail, 'cocktail')
                .where('cocktail.cocktail_id = :cocktailId', {cocktailId: cocktailId}).getOne();
            if(!doesCocktailExists)
                throw new NotFoundException('Cocktail you try to review does not exist');

            //check if users review for that cocktail already exists
            const doesReviewExists = await manager.createQueryBuilder(Review, 'review')
                .where('review.user_id = :userId', {userId})
                .andWhere('review.cocktail_id = :cocktailId', {cocktailId}).getOne();
            if(doesReviewExists)
                throw new ConflictException('You have already reviewed that cocktail. If you want you can update it instead.');
            
            const newReview = manager.create(Review, {userId, cocktailId, ...reviewData});
            const saveReview = await manager.save(Review, newReview);

            const review = await manager.getRepository(Review).findOne({where: {reviewId: saveReview.reviewId}});
            if(!review)
                throw new NotFoundException('Review not found');
           
            return review;
        });
    }

    async updateReview(userId: number, reviewId: number, updatedReviewData: UpdateReviewDTO) {
        return this.dataSource.transaction(async manager => {
            //checking if review exists
            const review = await manager.findOne(Review, {where: {reviewId}});
            if(!review)
                throw new NotFoundException('Review with that id not found');

            //checking user is the creator or the admin
            const userRoleId = await manager.createQueryBuilder(User, 'user')
                .innerJoin('user.role', 'role')
                .where('user.userId = :userId', {userId})
                .select('role.roleId', 'roleId')
                .getRawOne();

            if(review.userId !== userId && userRoleId === 1)
                throw new ForbiddenException('You are not the creator of the review');

            manager.merge(Review, review, updatedReviewData);
            await manager.save(Review, review);

            return manager.getRepository(Review).findOne({where: {reviewId}});
        });
    }

    async deleteReview(userId: number, reviewId: number) : Promise<void>{
        return this.dataSource.transaction(async manager => {
            //checking if review exists
            const review = await manager.findOne(Review, {where: {reviewId}});
            if(!review)
                throw new NotFoundException('Review with that id not found');

            //checking user is the creator or the admin
            const userRoleId = await manager.createQueryBuilder(User, 'user')
                .innerJoin('user.role', 'role')
                .where('user.userId = :userId', {userId})
                .select('role.roleId', 'roleId')
                .getRawOne();

            if(review.userId !== userId && userRoleId === 1)
                throw new ForbiddenException('You are not the creator of the review');

            await manager.remove(Review, review);
            
        });
    }
}
