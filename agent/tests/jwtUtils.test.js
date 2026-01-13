import { describe, it, expect } from 'vitest';
import { parseJwtExpSeconds } from '../src/utils/jwtUtils.js';

function makeToken(payload) {
    const base64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `aaa.${base64}.bbb`;
}

describe('parseJwtExpSeconds', () => {
    it('returns exp when token is valid', () => {
        const token = makeToken({ exp: 123456 });
        expect(parseJwtExpSeconds(token)).toBe(123456);
    });

    it('returns null for malformed token', () => {
        expect(parseJwtExpSeconds('invalid')).toBeNull();
    });

    it('returns null when no exp', () => {
        const token = makeToken({ foo: 'bar' });
        expect(parseJwtExpSeconds(token)).toBeNull();
    });
});
