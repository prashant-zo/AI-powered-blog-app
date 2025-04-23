import { z } from "zod";

export const userIdSchema = z.object({
    id: z.string().cuid({ message: "Invalid user ID format" }),
});

export const updateUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: "Name cannot be empty if provided" })
        .optional(),
    bio: z
        .string()
        .trim()
        .optional()
        .nullable(), 
    avatarUrl: z
        .string()
        .url({ message: "Invalid URL format for avatar" })
        .optional()
        .nullable(),
}).strict()
  .refine(data => Object.keys(data).length > 0, {
    message: "Request body cannot be empty. Please provide at least one field to update.", 
});


export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdParam = z.infer<typeof userIdSchema>;