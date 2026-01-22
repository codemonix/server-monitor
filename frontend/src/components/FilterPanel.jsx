import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Drawer, Box, Typography, Slider, FormControlLabel, Checkbox, Button, Stack, Divider } from "@mui/material";
import RangeSliderControl from "./RangeSliderControl.jsx";

export default function FilterPanel({ open, onClose, currentFilters, onApply }) {
    // const dispatch = useDispatch();
    const agents = useSelector( state => state.metrics.items || [] );
    const [draft, setDraft] = useState(currentFilters);
    // const currentFilters = useSelector( state => state.metricPoints.filters);

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


    // const toggleAgent = (id) => {
    //     setDraft( prev => {
    //         const next = prev.agentIds.includes(id) ? prev.agentIds.filter( a => a !== id ) : [...prev.agentIds, id ];
    //         return { ...prev, agentIds: next };
    //     });
    // }

    const setRanges = (field, v) => {
        setDraft( prev => ({ ...prev,
            ranges: { ...prev.ranges, [field]: { min: v[0], max: v[1] }}}));
    };

    return (

        <Drawer anchor="right" open={open} onClose={onClose} >
            <Box sx={{ width: 360, p: 2, mt: 2 }} >
                <Typography variant="h6" >Filters</Typography>
                <Divider sx={{ my: 1 }} />
                {/* <Typography variant="subtitle2" >Agents</Typography> */}
                {/* <Box sx={{ maxHeight: 180, overflow: "auto", mb: 2 }} >
                    {agents.map((agent) => (
                        <FormControlLabel 
                            key={agent._id}
                            control={
                                <Checkbox checked={draft.agentIds.includes(agent._id)} onChange={() => toggleAgent(agent._id)} />
                            }
                            label={agent.name}
                        />
                    ))}
                </Box> */}

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

                {/* <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" >CPU %</Typography>
                <Slider value={[draft.ranges?.cpu.min ?? 0, draft.ranges?.cpu?.max ?? 100]} min={0} max={100} step={1} valueLabelDisplay="on" aria-labelledby="mem-slider" onChange={setRanges("cpu")} />

                <Typography variant="subtitle2" >Memory %</Typography>
                <Slider value={[draft.ranges?.memPercent?.min ?? 0, draft.ranges?.memPercent?.max ?? 100]} onChange={setRanges("memPercent")} min={0} max={100} />

                <Typography variant="subtitle2" >Disk %</Typography>
                <Slider value={[ draft.ranges?.diskPercent?.min ?? 0, draft.ranges?.diskPercent?.max ?? 100]} onChange={setRanges("diskPercent")} min={0} max={100} /> */}

                {/* <Typography variant="subtitle2" >Network %</Typography>
                <Slider value={[ranges.network?.min ?? 0, ranges.network?.max ?? 100]} onChange={handleRanges('network')} min={0} max={100} /> */}

                {/* <Stack direction='row' spacing={1} sx={{ mt: 1 }} >
                    <Button variant="outlined" onClick={reset} >Reset</Button>
                    <Button variant="contained" onClick={apply} >Apply</Button>
                </Stack> */}
                <Box sx={{ mt: 2 }} >
                    <Button variant="contained" onClick={() => onApply(draft)} >Apply</Button>
                </Box>
            </Box>
        </Drawer>
    )
}