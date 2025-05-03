import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getPrismaClient } from '../db/index';
import { UserService } from '../services/user.service';
import { type Env } from '../config/env';
import { type UserIdParam, type UpdateUserInput, userIdSchema, updateUserSchema } from '../schemas/user.schema';
import { type ValidatedJsonInput } from '../types/hono'; 


// Handles GET /api/v1/user/:id requests.
export const getUserProfileHandler = async (c: Context<{ Bindings: Env }, '/:id'>): Promise<Response> => {
    try {
        const params = c.req.param() as UserIdParam; // Type assertion based on route setup

        const prisma = getPrismaClient(c.env);
        const userService = new UserService(prisma, c.env);

        const userProfile = await userService.getUserProfile(params);

        return c.json({
            success: true,
            message: 'User profile retrieved successfully.',
            data: userProfile,
        });

    } catch (error: any) {
        console.error(`Get User Profile Handler Error: ${error.message}`, error.stack);
        if (error instanceof HTTPException) {
            throw error;
        }
        throw new HTTPException(500, {
            message: 'An unexpected error occurred while retrieving the user profile.',
            cause: error,
        });
    }
};

// Handles PUT /api/v1/user/:id requests.
export const updateUserProfileHandler = async (
    c: Context<{ Bindings: Env }, '/:id', ValidatedJsonInput<typeof updateUserSchema>>
): Promise<Response> => {
    try {
        // --- Get validated data ---
        const params = c.req.param() as UserIdParam; 
        const validatedBody = c.req.valid('json'); 

        // --- Get authenticated user ---
        const authenticatedUser = c.get('user'); 
        if (!authenticatedUser?.id) {
            console.error("Update User Profile Handler Error: Authenticated user ID not found in context.");
            throw new HTTPException(401, { message: 'Authentication required.' });
        }
        const authenticatedUserId = authenticatedUser.id;

        // --- Call service ---
        const prisma = getPrismaClient(c.env);
        const userService = new UserService(prisma, c.env);

        const updatedUser = await userService.updateUserProfile(params, validatedBody, authenticatedUserId);

        return c.json({
            success: true,
            message: 'User profile updated successfully.',
            data: updatedUser,
        });

    } catch (error: any) {
        console.error(`Update User Profile Handler Error: ${error.message}`, error.stack);
        if (error instanceof HTTPException) {
            throw error;
        }
        throw new HTTPException(500, {
            message: 'An unexpected error occurred while updating the user profile.',
            cause: error,
        });
    }
};