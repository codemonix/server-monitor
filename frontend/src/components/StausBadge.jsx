

export default function StatusBadge({ status }) {
    const cls = status === 'online' ? 'ok' : status === 'degraded' ? 'warn' : 'error';
    return <span className={`badge ${cls}`}>{ status || 'unknown' }</span>
}