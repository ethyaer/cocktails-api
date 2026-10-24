import { Controller, Get, Param, NotFoundException, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserView } from '../entities/views/user.view';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    async loginUser(@Body() body: { login: string; password: string }) {
        return this.authService.loginUser(
            body.login,
            body.password,
        );
    }

    @Post('register')
    async registerUser(@Body() body: { login: string; password: string }){
        return this.authService.registerUser(
            body.login,
            body.password,
        );
    }

    @Get()
    async changePassword(@Param('userId') userId: number, @Param('oldPassword') oldPassword: string, @Param('newPassword') newPassword: string): Promise<void> {
        await this.authService.changePassword(userId, oldPassword, newPassword);
    }

    @Get()
    async changeName(@Param('userId') userId: number, @Param('newName') newName: string): Promise<void> {
        await this.authService.changeName(userId, newName);
    }
}
