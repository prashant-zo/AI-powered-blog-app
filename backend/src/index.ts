import { Hono } from 'hono';
import { cors } from 'hono/cors'; 
import { logger } from 'hono/logger'; 
import { HTTPException } from 'hono/http-exception'; 
import { prettyJSON } from 'hono/pretty-json'; 

import { type Env } from './config/env'; 
import apiV1Router from './routes/index'; 

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());

app.use('*', prettyJSON());

app.use(
    cors({
        origin: '*', 
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
        allowHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
        exposeHeaders: ['Content-Length'], // Headers client can access in response
        maxAge: 600, // How long preflight request results can be cached (seconds)
        credentials: true, // Allow cookies/credentials (if needed)
    })
);



// Mount all routes defined in src/routes/index.ts under the /api/v1 path
app.route('/api/v1', apiV1Router);

// Simple health check or welcome message at the root path "/"
app.get('/', (c) => {
    return c.json({
        success: true,
        message: 'Welcome to the Blog AI Backend API!',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

app.notFound((c) => {
    return c.json({
        success: false,
        message: `Not Found: The requested resource '${c.req.path}' does not exist.`
    }, 404);
});

// This catches errors thrown from any middleware or route handler
app.onError((err, c) => {
    console.error(`API Error: ${err}`, err.stack); 

    if (err instanceof HTTPException) {
        return c.json(
            {
                success: false,
                message: err.message,
            },
            err.status 
        );
    }

    // For any other unexpected errors, return a generic 500 response
    console.error('Unhandled Exception:', err); 
    return c.json(
        {
            success: false,
            message: 'Internal Server Error. Please try again later.',
        },
        500 
    );
});


export default app;