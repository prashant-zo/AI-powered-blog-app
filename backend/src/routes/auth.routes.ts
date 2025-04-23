import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { signinSchema, signupSchema } from '../schemas/auth.schema';
import { signinHandler, signupHandler, logoutHandler } from '../controllers/auth.controller';

const authRouter = new Hono();

// POST /signup
authRouter.post(
    '/signup',
    zValidator('json', signupSchema, (result, c) => {
        if (!result.success) {
            console.warn("Signup validation failed:", result.error.flatten());
            return c.json({
                success: false,
                message: 'Invalid input data.',
                errors: result.error.flatten().fieldErrors 
            }, 400);
        }
    }),
    signupHandler
);

// POST /signin
authRouter.post(
    '/signin',
    zValidator('json', signinSchema, (result, c) => {
         if (!result.success) {
            console.warn("Signin validation failed:", result.error.flatten());
            return c.json({
                success: false,
                message: 'Invalid input data.',
                errors: result.error.flatten().fieldErrors
            }, 400);
        }
    }),
    signinHandler
);

// GET /logout 
authRouter.get(
    '/logout',
    logoutHandler // No validation needed for this simple GET request
);


export default authRouter;