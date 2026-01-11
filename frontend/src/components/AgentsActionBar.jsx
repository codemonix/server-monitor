import { Stack, Button, Typography } from "@mui/material";

export default function AgentsActionBar({ onRefresh, onAdd, onDeleteSelected, disabledDelete }) {
    return (
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={1} mt={1} >
            {/* <Typography variant='h6' >Agents</Typography> */}

            <Stack direction='row' spacing={1} >
                <Button variant="contained" onClick={onAdd}>Add Agent</Button>
                <Button variant="outlined" onClick={onRefresh}>Refresh</Button>
                <Button variant="outlined" color="error" onClick={onDeleteSelected} disabled={disabledDelete} >
                    Delete Selected
                </Button>
            </Stack>
        </Stack>
    )
}