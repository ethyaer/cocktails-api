import { Controller, Get, Param, NotFoundException, Post, Body, Patch } from '@nestjs/common';
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

    @Patch('change-password')
    async changePassword(@Body() { userId, oldPassword, newPassword }: { userId: number; oldPassword: string; newPassword: string }): Promise<void> {
        await this.authService.changePassword(userId, oldPassword, newPassword);
    }

    @Patch('update-name')
    async changeName(@Body() { userId, newName }: { userId: number; newName: string }): Promise<void> {
        await this.authService.changeName(userId, newName);
    }
}
