import { type PrismaClient } from "@prisma/client/edge";
import { HTTPException } from "hono/http-exception";
import type { UpdateUserInput, UserIdParam } from "../schemas/user.schema";
import { type Env } from "../config/env";

interface IuserPrismaClient {
    user: {
        findUniqueOrThrow: (...args: any[]) => Promise<any>;
        update: (...args: any[]) => Promise<any>;
    }
}

export class UserService {
    private prisma: IuserPrismaClient;
    private env: Env;

    constructor(prisma: IuserPrismaClient, env: Env) {
        this.prisma = prisma;
        this.env = env;
    }

    async getUserProfile(params: UserIdParam) {
        console.log(`Fetching profile for user ID: ${params.id}`);
        try {
            const user = await this.prisma.user.findUniqueOrThrow({
                where: { id: params.id },
                select: { 
                    id: true,
                    email: true, 
                    name: true,
                    bio: true,
                    avatarUrl: true,
                    createdAt: true,
                }
            });
            return user;
        } catch (error: any) {
            console.error(`Error fetching profile for user ${params.id}:`, error);
             if (error.code === 'P2025') { // P2025 is Prisma's code for "Record to update not found." (also applies to findUniqueOrThrow)
                 throw new HTTPException(404, { message: `User with ID ${params.id} not found.` });
             }
            // Otherwise, it's likely a different database issues
            throw new HTTPException(500, { message: 'Database error fetching user profile.', cause: error });
        }
    }

    async updateUserProfile(params: UserIdParam, input: UpdateUserInput, authenticatedUserId: string) {
        const targetUserId = params.id;
        console.log(`Attempting to update profile for user ID: ${targetUserId} by user: ${authenticatedUserId}`);

        if (authenticatedUserId !== targetUserId) {
            console.warn(`Authorization failed: User ${authenticatedUserId} tried to update profile of ${targetUserId}`);
            throw new HTTPException(403, { message: 'You are not authorized to update this profile.' }); // 403 Forbidden
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
             if (error.code === 'P2025') { // P2025: "Record to update not found."
                 throw new HTTPException(404, { message: `User with ID ${targetUserId} not found.` });
             }
            throw new HTTPException(500, { message: 'Database error updating user profile.', cause: error });
        }
    }
}