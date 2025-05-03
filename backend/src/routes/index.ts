// src/routes/index.ts
import { Hono } from 'hono';
import { type Env } from '../config/env';

import authRouter from './auth.routes';
import userRouter from './user.routes'; // <-- Import the user router
// import blogRouter from './blog.routes'; // Placeholder for blog routes
// import aiRouter from './ai.routes';   // Placeholder for AI routes

// Create the main router for the /api/v1 namespace
const apiV1Router = new Hono<{ Bindings: Env }>();

// --- Mount Feature Routers ---

// Mount authentication routes under /api/v1/auth/*
apiV1Router.route('/auth', authRouter);

// Mount user profile routes under /api/v1/user/*
apiV1Router.route('/user', userRouter); // <-- Add this line

// Mount other routes here when ready
// apiV1Router.route('/blog', blogRouter);
// apiV1Router.route('/ai', aiRouter);


// --- Optional: Add a base route for /api/v1 ---
apiV1Router.get('/', (c) => {
  return c.json({
    message: 'Welcome to the Blog AI API v1!',
    timestamp: new Date().toISOString(),
  });
});


// Export the aggregated v1 router
export default apiV1Router;