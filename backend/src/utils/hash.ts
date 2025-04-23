const SALT_LENGTH = 16; 
const HASH_ALGORITHM = 'SHA-512'
const PBKDF2_ITERATIONS = 150000
const PBKDF2_KEY_LENGTH = 64;


export async function hashPassword(password: string): Promise<string> {
    try {
        const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

        const passwordBuffer = new TextEncoder().encode(password);

        const key = await crypto.subtle.importKey(
            'raw',           
            passwordBuffer,  
            { name: 'PBKDF2' }, 
            false,           
            ['deriveBits']   
        );

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: PBKDF2_ITERATIONS,
                hash: HASH_ALGORITHM,
            },
            key,                        
            PBKDF2_KEY_LENGTH * 8       
        );

        const hashArray = Array.from(new Uint8Array(derivedBits));
        const saltArray = Array.from(salt);
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return `${saltHex}:${hashHex}`;
    } catch (error) {
        console.error("Error during password hashing:", error);
        throw new Error("Failed to hash password.");
    }
}


export async function comparePassword(password: string, storedHashString: string): Promise<boolean> {
    try {
        const parts = storedHashString.split(':');
        if (parts.length !== 2) {
            console.warn("Invalid stored hash format encountered during comparison.");
            return false; 
        }
        const [saltHex, storedHashHex] = parts;

        
        if (!/^[0-9a-fA-F]+$/.test(saltHex) || !/^[0-9a-fA-F]+$/.test(storedHashHex)) {
             console.warn("Invalid hex character encountered in stored hash/salt.");
             return false;
        }
        
        if (saltHex.length !== SALT_LENGTH * 2) {
            console.warn(`Salt length mismatch. Expected ${SALT_LENGTH*2} hex chars, got ${saltHex.length}.`);
            return false;
        }
        const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        const storedHashBytes = new Uint8Array(storedHashHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

        const passwordBuffer = new TextEncoder().encode(password);

        const key = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt, 
                iterations: PBKDF2_ITERATIONS, 
                hash: HASH_ALGORITHM,       
            },
            key,
            PBKDF2_KEY_LENGTH * 8 
        );

        const derivedHashBytes = new Uint8Array(derivedBits);

        
        if (derivedHashBytes.length !== storedHashBytes.length) {
            return false;
        }
        
        let difference = 0;
        for (let i = 0; i < derivedHashBytes.length; i++) {
            difference |= derivedHashBytes[i] ^ storedHashBytes[i]; 
        }

        return difference === 0;

    } catch (error) {
        console.error("Error during password comparison:", error);
        return false;
    }
}