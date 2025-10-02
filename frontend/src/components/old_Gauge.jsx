

export default function Gauge({ value = 0, label ='', dangerAt = 80  }) {
    const v = Math.max(0, Math.min(100, value));
    const color = v >= dangerAt ? '#dc2626' : v >= 50 ? '#ca8a04' : '#059669';
    const dash = `${(v/100)*100}, 100`;

    return (
        <div className="gauge">
            <svg viewBox="0 0 36 36" className="gauge-svg" >
                <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" fill="#f5f5f5" />
                <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" strokeWidth="4" stroke={color} strokeDasharray={dash} fill="none" />
                <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="8" fill="#111">{Math.round(v)}</text>
            </svg>
            <div className="gauge-meta">
                <div className="gauge-label">{label}</div>
                <div className="gauge-sub">{Math.round(v)}%</div> 
            </div>
        </div>
    )
}
