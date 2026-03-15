import * as CryptoJS from 'crypto-js';

// Use a static passphrase for now or optionally involve window.location.host, etc., 
// to ensure the key is slightly obscured. Note: In a client-side app, this key 
// is inherent to the bundle and can be reverse engineered, but it stops basic automated grabbers.
const SECRET_KEY = 'Zyphra_Secure_Storage_S$cret_K3y_2026';

/**
 * Obfuscates the storage key using SHA256 so the key name isn't obvious
 * like 'discord_token' or 'user'
 */
const hashKey = (key: string): string => {
    return CryptoJS.SHA256(key + SECRET_KEY).toString(CryptoJS.enc.Hex);
};

/**
 * secureStorage provides an encrypted wrapper around localStorage
 */
export const secureStorage = {
    /**
     * Encrypts and stores a value
     */
    setItem: (key: string, value: string): void => {
        try {
            const encryptedValue = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
            const hashedKey = hashKey(key);
            localStorage.setItem(hashedKey, encryptedValue);
        } catch (error) {
            console.error('Error encrypting and storing data:', error);
        }
    },

    /**
     * Retrieves and decrypts a value
     */
    getItem: (key: string): string | null => {
        try {
            const hashedKey = hashKey(key);
            const encryptedValue = localStorage.getItem(hashedKey);

            if (!encryptedValue) {
                return null;
            }

            const decryptedBytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
            const decryptedValue = decryptedBytes.toString(CryptoJS.enc.Utf8);

            // If decryption fails, it will return an empty string
            if (!decryptedValue) {
                return null;
            }

            return decryptedValue;
        } catch (error) {
            console.error('Error retrieving and decrypting data:', error);
            return null;
        }
    },

    /**
     * Removes an encrypted item
     */
    removeItem: (key: string): void => {
        try {
            const hashedKey = hashKey(key);
            localStorage.removeItem(hashedKey);
        } catch (error) {
            console.error('Error removing encrypted data:', error);
        }
    },

    /**
     * Clears the entire local storage
     */
    clear: (): void => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
};
