import { type MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { verifyToken, type UserJWTPayload } from "../utils/jwt";
import { type Env } from "../config/env";

export const authMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
        console.warn('Auth Middleware: Missing Authorization header');
        throw new HTTPException(401, { message: 'Authorization header is missing.'});
    }
    
    // Check the format 'Bearer <token>'
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        console.warn('Auth Middleware: Invalid Authorization header format');
        throw new HTTPException(401, { message: 'Invalid Authorization header format. Expected: Bearer <token>.' });
    }

    const token = parts[1];
    if (!token) {
        console.warn('Auth Middleware: Token missing after Bearer');
        throw new HTTPException(401, { message: 'Bearer token is missing.' });
    }

    try {
        const userPayload = await verifyToken(token, c.env);

        c.set('user', userPayload as UserJWTPayload);

        console.log(`Auth Middleware: User authenticated - ${userPayload.userId} (${userPayload.email})`);

        await next();

    } catch (error: any) {
        console.warn(`Auth Middleware: Token verification failed - ${error.message}`);

        throw new HTTPException(401, { message: error.message || 'Invalid or expired token.' , cause: error });
    }
}


