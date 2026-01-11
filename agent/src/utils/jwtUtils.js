
export function parseJwtExpSeconds(token) {
    if (!token) return null;
    try {
        const parts = token.split('.');
        if ( parts.length !== 3 ) return null;
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload && payload.exp ) return Number(payload.exp);
        return null;
    } catch (error) {
        console.error("Failed to parse JWT token:", error.message);
        return null;
    }
}