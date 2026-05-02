import { Dialog, DialogContent, DialogTitle, DialogActions, Typography, TextField, IconButton, Alert, Button, Box } from "@mui/material";
import ContentCopyIcon  from '@mui/icons-material/ContentCopy';

export default function AddAgentDialog ({ isDialogOpen, handleCloseDialog, newToken, handleCopy, copyStatus }) {
    return (

    <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm" >
        <DialogTitle >Enrollment Token Created</DialogTitle>
        <DialogContent dividers >
            <Typography variant="body1" sx={{ mb: 2 }} >
                Use the followinf token to enroll new agrnt.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} >
                <TextField 
                    fullWidth
                    value={newToken}
                    label="New Enrollment Token"
                    InputProps={{ readOnly: true}}
                />
                <IconButton 
                    onClick={handleCopy}
                    color="primary"
                    aria-label="copy token"
                >
                    <ContentCopyIcon />
                </IconButton>
            </Box>

            {copyStatus === 'error' && (
                <Alert severity="error" sx={{ mt: 2 }} >
                    Failed to copy token, Please copy it manually.
                </Alert>
            )}
        </DialogContent>
        <DialogActions >
            <Button onClick={handleCloseDialog} color="primary" variant="contained" >
                Done
            </Button>
        </DialogActions>
    </Dialog>
    )
}