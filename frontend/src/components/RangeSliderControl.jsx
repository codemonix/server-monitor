import { Box, Typography, TextField, Slider } from "@mui/material";

const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
}

export default function RangeSliderControl({
    label,
    value,
    min = 0,
    max = 100,
    step = 1,
    onChange
}) {
    const [ vMin, vMax ] = value;

    const handleInput = (index) => (e) => {
        const next = [...value];
        next[index] = clamp(Number(e.target.value), min, max);
        onChange(next);
    };

    return (
        <Box mb={2} >
            <Box display='flex' alignItems='center' gap={1} mb={0.5} >
                <Typography variant="subtitle2" sx={{ minWidth: 90 }} >
                    {label}
                </Typography>

                <TextField 
                    type="number"
                    size="small"
                    value={vMin}
                    onChange={handleInput(0)}
                    slotProps={{
                        input: { min, max, step },
                    }}
                    sx={{ width: 72 }}
                />

                <Typography variant="body2" > - </Typography>

                <TextField 
                    type="number"
                    size="small"
                    value={vMax}
                    onChange={handleInput(1)}
                    slotProps={{
                        input: { min, max, step },
                    }}
                    sx={{ width: 72 }}
                />
            </Box>

            <Slider 
                value={value}
                min={min}
                max={max}
                // step={step}
                // valueLabelDisplay="on"
                onChange={(_, newValue) => onChange(newValue)}
            />

        </Box>
    )
}