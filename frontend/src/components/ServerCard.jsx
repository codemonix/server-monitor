import StatusBadge from './StatusBadge.jsx';

export default function ServerCard({ server, onOpen }) {
    return (
        <div className='card' onClick={onOpen} role='button' tabIndex={0}>
            <div className='card-head'>
                <div className='title'>{server.name}</div>
                <StatusBadge status={server.status} />
            </div>
            <div className='muted-small'>{server.type} • {server.ip}</div>
            <div className='tags'>
                {(server.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
            </div>
        </div>
    )
}