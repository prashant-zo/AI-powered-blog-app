import { HTTPException } from "hono/http-exception";
import type { UpdateUserInput, UserIdParam } from "../schemas/user.schema";
import { type Env } from "../config/env";

interface UserProfilePrismaClient {
    user: {
        findUniqueOrThrow: (args: {
            where: { id: string };
            select?: any; 
        }) => Promise<any>; 
        update: (args: {
            where: { id: string };
            data: any; 
            select?: any;
        }) => Promise<any>; 
    }
}

export class UserService {
    private prisma: UserProfilePrismaClient;
    private env: Env;

    constructor(prisma: UserProfilePrismaClient, env: Env) {
        this.prisma = prisma;
        this.env = env;
    }

    async getUserProfile(params: UserIdParam) {
        const userId = params.id;
        console.log(`Fetching profile for user ID: ${userId}`);
        try {
            const user = await this.prisma.user.findUniqueOrThrow({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    bio: true,
                    avatarUrl: true,
                    createdAt: true,
                }
            });
            console.log(`Successfully fetched profile for user ID: ${userId}`);
            return user;
        } catch (error: any) {
            console.error(`Error fetching profile for user ${userId}:`, error);
             if (error.code === 'P2025') { 
                 throw new HTTPException(404, { message: `User with ID ${userId} not found.` });
             }
            throw new HTTPException(500, { message: 'Database error fetching user profile.', cause: error });
        }
    }

    async updateUserProfile(params: UserIdParam, input: UpdateUserInput, authenticatedUserId: string) {
        const targetUserId = params.id;
        console.log(`Attempting profile update for user ID: ${targetUserId} by authenticated user: ${authenticatedUserId}`);

        if (authenticatedUserId !== targetUserId) {
            console.warn(`Authorization Failed: User ${authenticatedUserId} attempted to update profile of ${targetUserId}.`);
            throw new HTTPException(403, { message: 'You are not authorized to update this profile.' });
        }

        if (Object.keys(input).length === 0) {
             throw new HTTPException(400, { message: 'No update data provided.' });
        }

        try {
            const updatedUser = await this.prisma.user.update({
                where: { id: targetUserId },
                data: {
                    ...(input.name !== undefined && { name: input.name }),
                    ...(input.bio !== undefined && { bio: input.bio }),
                    ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    bio: true,
                    avatarUrl: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            console.log(`Successfully updated profile for user ID: ${targetUserId}`);
            return updatedUser;
        } catch (error: any) {
            console.error(`Error updating profile for user ${targetUserId}:`, error);
             if (error.code === 'P2025') { 
                 throw new HTTPException(404, { message: `User with ID ${targetUserId} not found.` });
             }
            throw new HTTPException(500, { message: 'Database error updating user profile.', cause: error });
        }
    }
}