import { type PrismaClient as BasePrismaClient } from '@prisma/client/edge';
import { HTTPException } from 'hono/http-exception'; 
import { comparePassword, hashPassword } from '../utils/hash'; 
import { generateToken, type UserJWTPayload } from '../utils/jwt'; 
import type { SigninInput, SignupInput } from '../schemas/auth.schema'; 
import { type Env } from '../config/env'; 

interface IAuthPrismaClient {
    user: {
        findUnique: (...args: any[]) => Promise<any>;
        create: (...args: any[]) => Promise<any>;
    }
}

export class AuthService {
    
    private prisma: IAuthPrismaClient;
    private env: Env;

    constructor(prisma: IAuthPrismaClient, env: Env) {
        this.prisma = prisma;
        this.env = env;
    }

    async signupUser(input: SignupInput): Promise<{ user: { id: string; email: string; name: string | null; createdAt: Date; }; token: string; }> {
        console.log(`Attempting signup for email: ${input.email}`);

        
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: input.email },
                select: { id: true } 
            });

            if (existingUser) {
                console.warn(`Signup failed: Email already exists - ${input.email}`);
                throw new HTTPException(409, { message: 'An account with this email address already exists.' }); 
            }
        } catch (error: any) {
             
             if (!(error instanceof HTTPException)) { 
                console.error("Prisma error checking existing user:", error);
                throw new HTTPException(500, { message: 'Database error checking user existence.', cause: error });
             }
             throw error; 
        }


        
        let hashedPassword: string;
        try {
            hashedPassword = await hashPassword(input.password);
        } catch (error: any) {
            console.error("Password hashing failed during signup:", error);
            throw new HTTPException(500, { message: 'Failed to secure password.', cause: error });
        }

        
        let newUser: { id: string; email: string; name: string | null; createdAt: Date; };
        try {
            newUser = await this.prisma.user.create({
                data: {
                    email: input.email,
                    password: hashedPassword, 
                    name: input.name || null, 
                },
                
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                }
            });
            console.log(`Successfully created user: ${newUser.id} (${newUser.email})`);
        } catch (error: any) {
            console.error("Prisma error creating user:", error);
            
            throw new HTTPException(500, { message: 'Failed to register user due to a database error.', cause: error });
        }

        
        let token: string;
        try {
            const tokenPayload: UserJWTPayload = { id: newUser.id, email: newUser.email };
            token = await generateToken(tokenPayload, this.env);
        } catch (error: any) {
            
            
            console.error("JWT generation failed after user creation:", error);
            
            throw new HTTPException(500, { message: 'User created, but failed to generate session token.', cause: error });
        }
        return { user: newUser, token };
    }

    
    async signinUser(input: SigninInput): Promise<{ user: { id: string; email: string; name: string | null; bio: string | null; avatarUrl: string | null; createdAt: Date; updatedAt: Date; }; token: string; }> {
        console.log(`Attempting signin for email: ${input.email}`);

        
        let user: { id: string; email: string; name: string | null; bio: string | null; avatarUrl: string | null; createdAt: Date; updatedAt: Date; password?: string } | null;
        try {
             user = await this.prisma.user.findUnique({
                where: { email: input.email },
                
            });

            if (!user) {
                console.warn(`Signin failed: User not found - ${input.email}`);
                throw new HTTPException(401, { message: 'Invalid email or password.' }); 
            }
        } catch (error: any) {
            if (!(error instanceof HTTPException)) {
                console.error("Prisma error finding user during signin:", error);
                throw new HTTPException(500, { message: 'Database error during login.', cause: error });
            }
            throw error;
        }


        
        let isPasswordValid: boolean;
        try {
            
             if (!user.password) {
                console.error(`Signin failed: User record missing password field - ${input.email}`);
                throw new HTTPException(500, { message: 'User data integrity issue.' });
            }
            isPasswordValid = await comparePassword(input.password, user.password);
        } catch (error: any) {
            console.error("Password comparison failed during signin:", error);
            throw new HTTPException(500, { message: 'Error verifying credentials.', cause: error });
        }

        if (!isPasswordValid) {
            console.warn(`Signin failed: Invalid password for user - ${input.email}`);
            throw new HTTPException(401, { message: 'Invalid email or password.' }); 
        }

        
        let token: string;
        try {
            const tokenPayload: UserJWTPayload = { id: user.id, email: user.email };
            token = await generateToken(tokenPayload, this.env);
        } catch (error: any) {
            console.error("JWT generation failed during signin:", error);
            throw new HTTPException(500, { message: 'Failed to generate session token.', cause: error });
        }

        
        const { password, ...userWithoutPassword } = user;

        console.log(`Successfully signed in user: ${user.id} (${user.email})`);
        return { user: userWithoutPassword, token };
    }
}