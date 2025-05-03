import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { type Env } from '../config/env';
import { userIdSchema, updateUserSchema } from '../schemas/user.schema';
import { getUserProfileHandler, updateUserProfileHandler } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const userRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/user/:id - Get User Profile
userRouter.get(
    '/:id',
    zValidator('param', userIdSchema, (result, c) => {
        if (!result.success) {
            console.warn("Get User Profile validation failed (param):", result.error.flatten());
            return c.json({
                success: false,
                message: 'Invalid user ID format provided.',
                errors: result.error.flatten().fieldErrors,
            }, 400);
        }
    }),
    getUserProfileHandler
);

// PUT /api/v1/user/:id - Update User Profile
userRouter.put(
    '/:id',
    authMiddleware,
    zValidator('param', userIdSchema, (result, c) => {
        if (!result.success) {
            console.warn("Update User Profile validation failed (param):", result.error.flatten());
            return c.json({
                success: false,
                message: 'Invalid user ID format provided.',
                errors: result.error.flatten().fieldErrors,
            }, 400);
        }
    }),
    zValidator('json', updateUserSchema, (result, c) => {
        if (!result.success) {
            console.warn("Update User Profile validation failed (body):", result.error.flatten());
            return c.json({
                success: false,
                message: 'Invalid update data provided.',
                errors: result.error.flatten().fieldErrors, 
            }, 400);
        }
    }),
    updateUserProfileHandler
);

export default userRouter;