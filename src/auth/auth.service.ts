import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from '../entities/user.entity';
import {Role} from "../entities/role.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, @InjectRepository(User) private userRepository: Repository<User>) {}

    async generateToken(payload: any): Promise<string> {
        return this.jwtService.signAsync(payload);
    }

    async loginUser(login: string, password: string): Promise<User | null> {
        // Implement your user validation logic here
        // For example, you can query the database to find the user by login and compare the password
        // If the user is valid, return the user object; otherwise, return null
        const user = await this.userRepository.findOne({ where: { login }, relations: { role: true } });
        if(!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        return user;
    }

    async registerUser(login: string, password: string): Promise<{ userId: number; login: string; roleId: number }> {
        // Check if the user already exists
        const doesUserExist = await this.userRepository.findOne({ where: { login } });
        if (doesUserExist) {
            throw new ConflictException('User with this login already exists');
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create the new user
        const newUser = this.userRepository.create({
            login,
            passwordHash: hashedPassword,
            roleId: 1
        });

        // Save the new user to the database
        return { userId: newUser.userId, login: newUser.login, roleId: newUser.roleId };
    }

    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isOldPasswordValid) {
            throw new UnauthorizedException('Invalid old password');
        }

        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        user.passwordHash = hashedNewPassword;
        await this.userRepository.save(user);
    } 

    async changeName(userId: number, newName: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.name = newName;
        await this.userRepository.save(user);
    }
    
    

}
