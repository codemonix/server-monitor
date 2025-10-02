
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";


const statusColors = {
  online: 'success.main',
  offline: 'error.main',
  warning: 'warning.main',
};


export default function ServerCard({ server, selected, onClick }) {

    return (
        <Card 
            onClick={onClick}
            variant={selected ? 'outlined' : 'elevation'}
            sx={{
                cursor: 'pointer',
                borderColor: selected ? 'primary.main' : undefined,
            }}
        >
            <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={1} >
                    <Typography variant='subtitle1' fontWeight={700} >
                        {server.name}
                    </Typography>
                    <Chip label={server.status} size="small" color={statusColors[server.status] || 'gray.300'} />
                </Box>

                <Typography variant='body2' >CPU: {server.cpu}% </Typography>
                <Typography variant='body2' >Memory: {server.mem} GB</Typography>
                <Typography variant='body2' >Uptime: {server.uptime}</Typography>
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