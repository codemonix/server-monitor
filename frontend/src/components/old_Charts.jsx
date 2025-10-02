import React from "react";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, YAxis } from "recharts";

export function TimeSeries({ data, keys }) {
    return (
        <div className="h64 bg-slate-900 border border-slate-800" >
            <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }} >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    {keys.map(key => (
                        <Line key={key} type="monotone" dataKey={key} name={key.name} dot={false} />
                    ))}
                </LineChart>
            </ResponsiveContainer>

        </div>
    )
}