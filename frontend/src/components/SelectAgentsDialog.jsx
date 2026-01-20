import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    FormGroup, 
    FormControlLabel, 
    Checkbox 
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { setHiddenAgentIds } from "../redux/slices/metricSlice.js";
import { useState, useEffect } from "react";

export default function SelectAgentsDialog({ open, onClose }) {
    const dispatch = useDispatch();
    const { items: agents, hiddenAgentIds } = useSelector(state => state.metrics);
    const [ localHidden, setLocalHidden ] = useState([]);

    useEffect(() => {
        setLocalHidden(hiddenAgentIds || []);
    },[hiddenAgentIds, open]);

    const handdleToggle = (id) => {
        if (localHidden.includes(id)) {
            setLocalHidden(localHidden.filter(hid => hid !== id));
        } else {
            setLocalHidden([...localHidden, id]);
        }
    };

    const handleSave = () => {
        dispatch(setHiddenAgentIds(localHidden));
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle >Select Visible Agents</DialogTitle>
            <DialogContent dividers >
                <FormGroup >
                    {agents.map(agent => (
                        <FormControlLabel 
                            key={agent._id}
                            control={
                                <Checkbox 
                                    checked={!localHidden.includes(agent._id)} 
                                    onChange={() => handdleToggle(agent._id)}
                                />
                            }
                            label={agent.name || agent.host}
                        />
                    ))}
                    { agents.length === 0 && <span style={{ padding: 10 }} >No agents found</span> }
                </FormGroup>
            </DialogContent>
            <DialogActions >
                <Button onClick={onClose} >Cancel</Button>
                <Button variant="contained" onClick={handleSave} >Save</Button>
            </DialogActions>
        </Dialog>
    )

}
