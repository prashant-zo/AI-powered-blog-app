import { z } from 'zod';

export const signupSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim() 
        .min(1, { message: "Email cannot be empty" }) 
        .email({ message: "Please provide a valid email address" }),

    password: z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" }),

    name: z
        .string()
        .trim()
        .min(1, { message: "Name cannot be empty" })
        .optional() 
        .nullable(), 
});

export const signinSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .min(1, { message: "Email cannot be empty" })
        .email({ message: "Please provide a valid email address" }),

    password: z
        .string({ required_error: "Password is required" })
        .min(1, { message: "Password cannot be empty" }), 
});

export type SignupInput = z.infer<typeof signupSchema>; 
export type SigninInput = z.infer<typeof signinSchema>;