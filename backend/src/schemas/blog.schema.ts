import { z } from 'zod';

// Schema for identifying a blog post by its ID (usually in path parameters)
export const blogIdSchema = z.object({
    id: z.string().cuid({ message: "Invalid blog post ID format" }),
});
export type BlogIdParam = z.infer<typeof blogIdSchema>;

// Schema for creating a new blog post
export const createBlogSchema = z.object({
    title: z
        .string({ required_error: "Title is required" })
        .trim()
        .min(3, { message: "Title must be at least 3 characters long" })
        .max(200, { message: "Title cannot exceed 200 characters" }),
    content: z
        .string({ required_error: "Content is required" })
        .trim()
        .min(10, { message: "Content must be at least 10 characters long" }),
    published: z
        .boolean()
        .optional() // Make publishing optional on creation, default is false in DB
        .default(false), // Default to false if not provided
});
export type CreateBlogInput = z.infer<typeof createBlogSchema>;

// Schema for updating an existing blog post
// All fields are optional, but at least one must be provided.
export const updateBlogSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, { message: "Title must be at least 3 characters long" })
        .max(200, { message: "Title cannot exceed 200 characters" })
        .optional(),
    content: z
        .string()
        .trim()
        .min(10, { message: "Content must be at least 10 characters long" })
        .optional(),
    published: z
        .boolean()
        .optional(),
}).strict() // Disallow extra fields not defined in the schema
  .refine(data => Object.keys(data).length > 0, {
    message: "Request body cannot be empty. Please provide at least one field to update.",
});
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;

// Schema for query parameters (e.g., for listing blogs - pagination/filtering)
// Start simple, can add more later (page, limit, authorId, published status)
export const listBlogsQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1), // Coerce string query param to number
    limit: z.coerce.number().int().positive().max(50).optional().default(10), // Max 50 per page
    // Add filters later:
    // published: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    // authorId: z.string().cuid().optional(),
});
export type ListBlogsQuery = z.infer<typeof listBlogsQuerySchema>;