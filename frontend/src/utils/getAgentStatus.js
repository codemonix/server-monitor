
export function getAgentStatus(metrics) {
    if (!metrics || !metrics.ts) return 'offline';

    const diff = Date.now() - new Date(metrics.ts).getTime();
    // console.log("getAgentStatus.js -> getAgentStatus -> ts:", metrics.ts);
    // console.log("getAgentStatus.js -> getAgentStatus -> diff:", diff);
    if ( diff < 7 * 1000 ) return 'online';
    if ( diff < 30 * 1000 ) return 'warning';
    return 'offline';
}

export const statusColors = {
    online: '#4caf50',
    offline: '#f44336',
    warning: '#ff9800',
};