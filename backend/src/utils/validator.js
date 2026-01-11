export function requireFiels( obj, fileds ) {
    const missing = fileds.filter( field => !(field in obj));
    if (missing.length) throw new Error(`Missing fields: ${missing.join(', ')}`)
}