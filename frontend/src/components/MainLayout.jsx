// import { useState } from "react";
// import { Outlet } from "react-router-dom";
// import { Box } from "@mui/material";
// import Topbar from "./Topbar.jsx";
// import Sidebar from "./Sidebar.jsx";


// const SIDEBAR_WIDTH = 260;

// export default function MainLayout() {
//     const [search, setSearch] = useState('');
//     const [filter, setFilter] = useState('all');

//     return (
//         <Box display='flex' minHeight='100vh' >
//             <Sidebar width={SIDEBAR_WIDTH} />
//             <Box flex='1' display='flex' flexDirection='column' >
//                 <Topbar 
//                     appName="Server Monitor"
//                     search={search}
//                     onSearcheChange={setSearch}
//                     filter={filter}
//                     onFilterChange={setFilter}
//                     sidebarWidth={SIDEBAR_WIDTH}
//                 />
//                 <Box component='main' sx={{ p: 2, bgcolor: "#f6f7fb", minHeight: 0, flex: 1 }} >
//                     <Outlet context={{ search, filter }} />
//                 </Box>
//             </Box>
//         </Box>
//     )
// }
