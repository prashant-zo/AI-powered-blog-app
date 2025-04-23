import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { UserService } from '../services/user.service';
import { getPrismaClient } from '../db';
import type { UpdateUserInput, UserIdParam } from '../schemas/user.schema';
import { type Env } from '../config/env';
import { type ValidatedJsonInput } from '../types/hono';