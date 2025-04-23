import { type Context } from 'hono'; 
import { PrismaClient } from '@prisma/client/edge';
import { HTTPException } from 'hono/http-exception'; 
import { AuthService } from '../services/auth.service'; 
import { getPrismaClient } from '../db/index'; 
import { type SigninInput, type SignupInput, signinSchema, signupSchema } from '../schemas/auth.schema';
import { type Env } from '../config/env';
import { type ValidatedJsonInput } from '../types/hono'; 

// Handles the POST /api/v1/auth/signup request.
export const signupHandler = async (c: Context<{ Bindings: Env }, '/signup', ValidatedJsonInput<typeof signupSchema>>): Promise<Response> => {
    try {
        const validatedBody = c.req.valid('json') as SignupInput;

        const prisma = getPrismaClient(c.env); 
        const env = c.env;

        const authService = new AuthService(prisma, env);

        const result = await authService.signupUser(validatedBody);

        return c.json(
            {
                success: true,
                message: 'User registered successfully.',
                data: result, // Contains { user: { id, email, name, createdAt }, token }
            },
            201
        );

    } catch (error: any) {
        console.error(`Signup Handler Error: ${error.message}`, error.stack);

        if (error instanceof HTTPException) {
            throw error;
        }

        throw new HTTPException(500, {
            message: 'An unexpected error occurred during registration.',
            cause: error 
        });
    }
};


//Handles the POST /api/v1/auth/signin request.
export const signinHandler = async (c: Context<{ Bindings: Env }, '/signin', ValidatedJsonInput<typeof signinSchema>>): Promise<Response> => {
    try {
        const validatedBody = c.req.valid('json') as SigninInput;

        const prisma = getPrismaClient(c.env);
        const env = c.env;

        const authService = new AuthService(prisma, env);

        const result = await authService.signinUser(validatedBody);

        return c.json(
            {
                success: true,
                message: 'Login successful.',
                data: result, // Contains { user: { ... (no password) }, token }
            },
            200 
        );

    } catch (error: any) {
        console.error(`Signin Handler Error: ${error.message}`, error.stack);

        if (error instanceof HTTPException) {
            throw error;
        }

        // Generic fallback error
        throw new HTTPException(500, {
            message: 'An unexpected error occurred during login.',
            cause: error
        });
    }
};


// Handles the GET /api/v1/auth/logout request (placeholder).
export const logoutHandler = (c: Context): Response => {
    // In a stateless JWT setup, the server doesn't need to do much.
    // The client is responsible for discarding the token.
    return c.json({
        success: true,
        message: 'Logout endpoint reached. Please clear the token on the client side.',
    });
};