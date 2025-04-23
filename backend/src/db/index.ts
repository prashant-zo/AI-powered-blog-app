import { PrismaClient } from '@prisma/client/edge'; // No need for PrismaClientOptions
import { withAccelerate } from '@prisma/extension-accelerate';
import { type Env } from '../config/env';

let prismaInstance: PrismaClient | ReturnType<typeof createAcceleratedClient> | null = null;

function createAcceleratedClient(env: Env) {
    console.log('Initializing new Accelerated Prisma Client instance...');
    const client = new PrismaClient({
        datasources: {
            db: {
                url: env.DATABASE_URL,
            },
        },
    }).$extends(withAccelerate());
    return client;
}

export function getPrismaClient(env: Env) {
    if (!prismaInstance) {
        prismaInstance = createAcceleratedClient(env);
    }
    return prismaInstance;
}

export async function disconnectPrisma(): Promise<void> {
    const instanceToDisconnect = prismaInstance;
    if (instanceToDisconnect) {
        try {
            await instanceToDisconnect.$disconnect();
            console.log('Prisma Client disconnected successfully.');
        } catch (error) {
            console.error('Error during Prisma disconnect:', error);
        } finally {
            prismaInstance = null;
        }
    } else {
        console.log('Prisma Client already disconnected or not initialized.');
    }
}
