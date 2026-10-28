import { ReviewsService } from './reviews.service';
import { Controller, Get, Param, ParseIntPipe, NotFoundException, UseGuards, Delete } from '@nestjs/common';
import { Body, Post, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from '@nestjs/common';
import { CreateReviewDTO } from './DTOs/create-review.dto';
import { Review } from '../entities/review.entity';
import { UpdateReviewDTO } from './DTOs/update-review.dto';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Get(':cocktailId')
    async getReviewsByCocktailId(cocktailId: number) {
        return this.reviewsService.getReviewsByCocktailId(cocktailId);
    }

    @Get(':userId')
    async getReviewsByUserId(userId: number) {
        return this.reviewsService.getReviewsByUserId(userId);
    }

    @Post(':cocktailId')
    @UseGuards(AuthGuard('jwt'))
    async createReview(@Param('cocktailId', ParseIntPipe) cocktailId: number, @Body() createReviewDTO: CreateReviewDTO, @Request() req: { user: { userId: number } }): Promise<Review> {
        return this.reviewsService.createReview(cocktailId, req.user.userId, createReviewDTO);
    }

    @Patch(':reviewId')
    @UseGuards(AuthGuard('jwt'))
    async updateReview(@Param('reviewId', ParseIntPipe) reviewId: number, @Body() updateReviewDTO: UpdateReviewDTO, @Request() req: { user: { userId: number } }): Promise<Review | null> {
        return this.reviewsService.updateReview(req.user.userId, reviewId, updateReviewDTO);
    }

    @Delete(':reviewId')
    @UseGuards(AuthGuard('jwt'))
    async deleteReview(@Param('reviewId', ParseIntPipe) reviewId: number, @Request() req: {user: {userId: number}}): Promise<void> {
        return this.reviewsService.deleteReview(req.user.userId, reviewId);
    }
}
