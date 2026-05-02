import { useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, Chip, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';

export default function UsersGrid({ users, loading, currentUserId, onEditRole, onResetPassword, onDelete}) {
    const columns = useMemo(() => [
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'role', headerName: 'Role', width: 150, 
            renderCell: (p) => <Chip label={p.value} color={ p.value === 'admin' ? 'primary' : 'default' } size="small" />
        },
        { field: 'actions', headerName: 'Actions', width: 180, sortable: false, 
            renderCell: (p) => {
                const isSelf = p.row._id === currentUserId;
                return (
                    <Box>
                        <Tooltip title="Edit Role">
                            <IconButton 
                                onClick={(e) => { e.stopPropagation(); onEditRole(p.row); }} 
                                color="primary" 
                                disabled={isSelf} 
                                size="small"
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Reset Password">
                            <IconButton 
                                onClick={(e) => { e.stopPropagation(); onResetPassword(p.row); }} 
                                color="warning" 
                                size="small" 
                            >
                                <LockResetIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete User">
                            <IconButton 
                                onClick={(e) => { e.stopPropagation(); onDelete(p.row._id); }} 
                                color="error" 
                                disabled={isSelf} 
                                size="small" 
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            }
        }
    ], [currentUserId, onEditRole, onResetPassword, onDelete]);

    return (
        <DataGrid 
            rows={users} 
            columns={columns} 
            getRowId={(row) => row._id } 
            loading={loading} 
            disableRowSelectionOnClick 
            sx={{ height: '100%', width: '100%' }}
        />
    )
}