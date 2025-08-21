import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function CpuChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={200} >
            <LineChart data={data} >
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cpu" stroke="#8884d8" />
            </LineChart>
        </ResponsiveContainer>
    )
}