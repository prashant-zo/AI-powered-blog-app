import 'hono'; 
import { type Env } from '../config/env'; 
import { type z, type ZodTypeAny } from 'zod';

type AuthUser = {
    id: string;
    email: string;
};

declare module 'hono' {
    interface Context {
        env: Env;
    }

    interface ContextVariableMap {
        user?: AuthUser;
    }
}

export type ValidatedJsonInput<T extends ZodTypeAny> = {
    in: { json: z.input<T> };   
    out: { json: z.infer<T> };  
};