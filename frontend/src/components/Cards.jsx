

export function StatCard({ title, value, sub }) {
    return(
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800" >
            <div className="text-slate-400 text-sm">{title}</div>
            <div className="text-2xl font-semibold text-white">{value}</div>
            {sub && <div className="text-slate-500 text-xs">{sub}</div>}
        </div>
    )
}