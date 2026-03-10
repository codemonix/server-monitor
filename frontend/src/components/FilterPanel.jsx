import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Drawer, Box, Typography, Slider, FormControlLabel, Checkbox, Button, Stack, Divider } from "@mui/material";
import RangeSliderControl from "./RangeSliderControl.jsx";

export default function FilterPanel({ open, onClose, currentFilters, onApply }) {
    const agents = useSelector( state => state.metrics.items || [] );
    const [draft, setDraft] = useState(currentFilters);

    console.log("FilterPanel.jsx -> agents:", agents);

    useEffect(() => {
        if (open) setDraft(currentFilters);
    },[open, currentFilters]);

    useEffect(() => {
        if ( agents.length > 0 && (!draft.agentIds || draft.agentIds.length === 0 )) {
            setDraft( prev => ({ ...prev,
                agentIds: agents.map((agent) => agent._id) }));
        }
    }, [agents, draft.agentIds]);

    const setRanges = (field, v) => {
        setDraft( prev => ({ ...prev,
            ranges: { ...prev.ranges, [field]: { min: v[0], max: v[1] }}}));
    };

    return (

        <Drawer anchor="right" open={open} onClose={onClose} >
            <Box sx={{ width: 360, p: 2, mt: 2 }} >
                <Typography variant="h6" >Filters</Typography>
                <Divider sx={{ my: 1 }} />

                <RangeSliderControl 
                    label="CPU %"
                    value={[
                        draft.ranges?.cpu?.min ?? 0,
                        draft.ranges?.cpu?.max ?? 100,
                    ]}
                    onChange={(v) => setRanges("cpu", v)}
                />

                <RangeSliderControl 
                    label="Memory %"
                    value={[
                        draft.ranges?.memPercent?.min ?? 0,
                        draft.ranges?.memPercent?.max ?? 100,
                    ]}
                    onChange={(v) => setRanges("memPercent", v)}
                />

                <RangeSliderControl 
                    label="Disk %"
                    value={[
                        draft.ranges?.diskPercent?.min ?? 0,
                        draft.ranges?.diskPercent?.max ?? 100,
                    ]}
                    onChange={(v) => setRanges("diskPercent", v)}
                />
                <Box sx={{ mt: 2 }} >
                    <Button variant="contained" onClick={() => onApply(draft)} >Apply</Button>
                </Box>
            </Box>
        </Drawer>
    )
}