import crypto from 'crypto';

export function verifyHmac({ body, timestamp, signature, secret }) {
    const payload = `${timestamp}.${JSON.stringify(body)}`;
    const mac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(signature));
}