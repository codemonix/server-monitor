
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { Speed, Storage, Memory, AccessTime, AvTimer } from "@mui/icons-material";
import { StatusPill } from "./StatusPill.jsx";
import { statusColors } from "../utils/getAgentStatus.js";


function correctNumToTwo(value) {
    const num = Number(value)
    return isFinite(num) ? num.toFixed(2) : "0.00";
}



export default function ServerCard({ server, selected, onClick }) {
    const memPercent = server.memTotal ? (server.memUsed / server.memTotal) *100 : 0;
    const diskPercent = server.diskTotal ? (server.diskUsed / server.diskTotal) *100 : 0;


    console.log("ServerCard.jsx -> statusColor:", statusColors[server.status]);

    return (
        <Card 
            onClick={onClick}
            variant={selected ? 'outlined' : 'elevation'}
            sx={{
                cursor: 'pointer',
                borderColor: selected ? 'primary.main' : undefined, 
                bgcolor: 'grey.300'
            }}
        >
            <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={1} >
                    <Typography variant='subtitle1' fontWeight={700} mr={1} >
                        {server.name}
                    </Typography>
                    <Chip label={server.status} size="small" sx={{
                        backgroundColor: statusColors[server.status],
                        color: '#fff'
                    }} />
                </Box>
                <Box display='flex' alignItems='center' gap={1}>
                    <Speed />
                    {/* <AnimatedPill value={server.cpu} label='{val}%' /> */}
                    <StatusPill value={`${server.cpu}`} label={`${correctNumToTwo(server.cpu)}%`} />
                </Box>
                <Box display='flex' alignItems='center' gap={1} >
                    <Memory />
                    <StatusPill value={memPercent} label={`${correctNumToTwo(server.memUsed / (2^1e9))}GB / ${correctNumToTwo(server.memTotal / (2^1e9))}GB` } />
                </Box>
                <Box display='flex' alignItems='center' gap={1} >
                    <Storage />
                    <StatusPill value={diskPercent} label={`${correctNumToTwo(server.diskUsed / (2^1e9))}GB / ${correctNumToTwo(server.diskTotal / (2^1e9))}GB` } />
                </Box>
                <Box display='flex' alignItems='center' gap={1} >
                    <AccessTime />
                    {/* <Timer /> */}

                </Box>
            </CardContent>
        </Card>
    )
}



















// import StatusBadge from './StatusBadge.jsx';

// export default function ServerCard({ server, onOpen }) {
//     return (
//         <div className='card' onClick={onOpen} role='button' tabIndex={0}>
//             <div className='card-head'>
//                 <div className='title'>{server.name}</div>
//                 <StatusBadge status={server.status} />
//             </div>
//             <div className='muted-small'>{server.type} • {server.ip}</div>
//             <div className='tags'>
//                 {(server.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
//             </div>
//         </div>
//     )
// }