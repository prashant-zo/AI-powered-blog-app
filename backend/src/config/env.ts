import { z } from 'zod';

// structure for cloudflare AI bindings objects
const AiBindingSchema = z.object({
    run: z.function()
         .args(z.string(), z.object({}).passthrough()) // model name, inputs
         .returns(z.promise(z.any()))
}).passthrough();


export const EnvSchema = z.object({
    DATABASE_URL: z.string().url("Invalid DATABASE_URL format")
                   .startsWith('prisma://', "DATABASE_URL must be a Prisma Accelerate URL (prisma://...)"),
    JWT_SECRET: z.string().min(32, { message: "JWT_SECRET must be at least 32 characters long" }),               
    AI: AiBindingSchema.refine(val => typeof val?.run === 'function', {
        message: "AI binding is missing or invalid",
    }),
});


export type Env = z.infer<typeof EnvSchema>


export function validateEnvironment(env: unknown): Env {
    const result = EnvSchema.safeParse(env);
    if (!result.success) {
        console.error('❌ Invalid environment variables:');
        // Log detailed errors
        for (const issue of result.error.issues) {
            console.error(`  - ${issue.path.join('.') || 'root'}: ${issue.message}`);
        }
        throw new Error('Invalid environment variables. Check worker bindings and secrets.');
    }
    console.log('✅ Environment variables validated successfully.');
    return result.data;
}
