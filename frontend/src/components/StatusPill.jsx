import { Box } from "@mui/material";





export function StatusPill({ value, label }) {
    return (
        <Box 
            sx={{
                position: 'relative',
                px: 1.5,
                py: 0.25,
                borderRadius: '9999px',
                bgcolor: 'grey.200',
                color: 'black',
                fontSize: '0.75rem',
                fontWeight: 500,
                lineHeight: 1.2,
                // display: 'inline-block',
                minWidth: '60px',
                // height: '20px',
                textAlign: 'center',
                overflow: "hidden",
            }}
        >
            {/* fill */}
            <Box 
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${value}%`,
                    bgcolor: `hsl(${(1 - value / 100) * 120}, 100%, 40%)`,
                    transition: 'width 0.6s ease, background-color 0.6s ease',
                }}
            />
            {/* Label */}
            <Box sx={{ position: 'relative', zIndex: 1 }} >
                {label}
            </Box>
        </Box>
    )
}