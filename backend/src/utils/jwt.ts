import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { type Env } from '../config/env'; 

const JWT_ALGORITHM = 'HS256';
const JWT_EXPIRATION_TIME = '2h';

export interface UserJWTPayload extends JWTPayload {
    id: string; 
    email: string;  
}

// Cache the encoded secret key for performance
let encodedSecret: Uint8Array | null = null;
function getEncodedSecret(env: Env): Uint8Array {
    if (!encodedSecret) {
        encodedSecret = new TextEncoder().encode(env.JWT_SECRET);
    }
    return encodedSecret;
}

export async function generateToken(payload: UserJWTPayload, env: Env): Promise<string> {
    try {
        const secretKey = getEncodedSecret(env);

        const jwt = await new SignJWT(payload)
            .setProtectedHeader({ alg: JWT_ALGORITHM }) 
            .setIssuedAt()                                          
            .setExpirationTime(JWT_EXPIRATION_TIME)   
            .sign(secretKey);                         

        return jwt;
    } catch (error) {
        console.error("Error generating JWT:", error);
        throw new Error("Failed to generate authentication token.");
    }
}

export async function verifyToken(token: string, env: Env): Promise<UserJWTPayload> {
    try {
        const secretKey = getEncodedSecret(env);

        const { payload } = await jwtVerify<UserJWTPayload>(
            token,
            secretKey,
            {
                algorithms: [JWT_ALGORITHM],   
            }
        );

        
        if (!payload.userId || !payload.email) {
            throw new Error("Invalid payload structure in token.");
        }

        return payload;

    } catch (error: any) {
        if (error.code === 'ERR_JWT_EXPIRED') {
            console.info('JWT Verification failed: Token expired');
            throw new Error('Token has expired');
        } else if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
            console.warn('JWT Verification failed: Signature mismatch');
            throw new Error('Invalid token signature');
        } else if (error.code === 'ERR_JWS_INVALID') {
            console.warn('JWT Verification failed: Malformed token');
            throw new Error('Malformed token');
        } else {
            console.error('JWT Verification failed:', error.message);
            throw new Error('Invalid token'); 
        }
    }
}