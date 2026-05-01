import { Box, Typography } from "@mui/material";

export function StatusPill({ value, label }) {
    const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
    
    return (
        <Box 
            sx={{
                position: 'relative',
                flexGrow: 1,
                height: 22,
                borderRadius: 1,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'grey.200',
                overflow: "hidden",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box 
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${safeValue}%`,
                    bgcolor: `hsl(${(1 - safeValue / 100) * 120}, 75%, 40%)`, // Slightly muted the saturation and lightness of the bar
                    transition: 'width 0.6s ease, background-color 0.6s ease',
                    opacity: 0.85,
                }}
            />
            
            <Typography 
                variant="caption" 
                sx={{ 
                    position: 'relative', 
                    zIndex: 1, 
                    fontWeight: 600,
                    // Use the theme's primary text color (off-white in dark mode) instead of pure #fff
                    color: (theme) => theme.palette.text.primary,
                    // Drastically reduced the text shadow spread so it doesn't look blurry
                    textShadow: (theme) => theme.palette.mode === 'dark' 
                        ? '0px 1px 1px rgba(0,0,0,0.6)' 
                        : '0px 1px 1px rgba(255,255,255,0.7)',
                    lineHeight: 1,
                    letterSpacing: '0.3px' // Slight letter spacing makes small numbers much more legible
                }}
            >
                {label}
            </Typography>
        </Box>
    );
}