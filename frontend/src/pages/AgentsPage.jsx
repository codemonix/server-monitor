import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api.js";
import { logger } from "../utils/log.js";
import AgentsGrid from "../components/AgentsGrid.jsx";
import AgentsActionBar from "../components/AgentsActionBar.jsx";
import { fetchServerStats } from "../redux/thunks/metricsThunks.js";
import { Tabs, Tab, Box} from "@mui/material";
import EnrollmentTokensGrid from "../components/EnrollmentTokensGrid.jsx";
import AddAgentDialog from "../components/AddAgentDialog.jsx";


export default function AgentsPage() {
    const dispatch = useDispatch();
    const { items: allAgents =[], hiddenAgentIds = [] } = useSelector((state) => state.metrics);
    const agents = allAgents.filter(agent => !hiddenAgentIds.includes(agent._id));
    
    const loading = useSelector((state) => state.metrics.state === "loading");

    const [ selectedAgents, setSelectedAgents ] = useState({ ids: new Set() });
    const [ tab, setTab ] = useState(0);
    const [ enrollmentTokens, setEnrollmentTokens ] = useState([]);

    const [ isTokenDialogOpen, setIsTokenDialogOpen ] = useState(false);
    const [ newToken, setNewToken ] = useState('');
    const [ copyStatus, setCopyStatus ] = useState(''); // 'success', 'error' , ...

    logger.info("Rendering AgentsPage");

    useEffect(() => {
        dispatch(fetchServerStats());
        fetchEnrollmentTokens();
        const interval = setInterval(() => dispatch(fetchServerStats()), 10000);
        return () => clearInterval(interval);
    }, [dispatch]);

    const handleRefresh = async () => {
        dispatch(fetchServerStats());
    }

    const fetchEnrollmentTokens = async () => {
        try {
            const res = await api.get('/agents/enrollment-tokens');
            console.log("AgentsPage.jsx -> fetchEnrollmentTokens -> res.data:", res.data);
            setEnrollmentTokens(res.data);
        } catch (error) {
            logger.error("AgentsPage.jsx -> fetchEnrollmentTokens -> error:", error.message);
        }
    }

    const handleAdd = async () => {
        try {
            const res = await api.post('/agents/enrollment');
            console.log("AgentsPage.jsx -> handleAdd -> res.data:", res.data.token);
            const createdToken = res.data.token;
            setNewToken(createdToken);
            setIsTokenDialogOpen(true);
            setCopyStatus('')
            if ( tab === 1 ) fetchEnrollmentTokens();
        } catch (error) {
            logger.error("AgentsPage.jsx -> handleAdd -> error creating enrollment token:", error.message);
            alert("Failed to create enrollment token.");
        }
        // placeholder
        console.log("Add agent clicked");
    }

    const handleCopy = useCallback(() => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(newToken)
                .then(() => {
                    setCopyStatus('success');
                    setTimeout(() => setCopyStatus(''), 2000);
                })
                .catch (error => {
                    logger.error("Failed to copy token", error.message);
                    setCopyStatus('error');
                })
        } else {
            alert("Clipboard access denied or not supported by browser");
            setCopyStatus('error');
        }
    }, [newToken])

    const handleCloseDialog = () => {
        setIsTokenDialogOpen(false);
        setNewToken('');
    }

    const handleTabChange = ( _, newValue ) => {
        setTab(newValue);
    }

    const handleDeleteSelected = async () => {
        console.log("AgentsPage.jsx -> handleDeleteSelected -> selectedAgents:", selectedAgents);
        if (!selectedAgents || selectedAgents.ids.size === 0) return;
        if (!window.confirm(`Delete ${selectedAgents.ids.size} selected agent(s) and related metrics?`)) return;

        try {
            //delete in parallel and reload
            await Promise.all(Array.from(selectedAgents.ids).map((id) => api.delete(`/agents/${id}`)));
            setSelectedAgents({ ids: new Set() });
            dispatch(fetchServerStats());
        } catch (error) {
            logger.error("AgentsPage.jsx -> handleDeleteSelected -> error deleting agents:", error.message);
        }
    };

    return (
        <Box>
            <AgentsActionBar 
                onRefresh={handleRefresh}
                onAdd={handleAdd}
                selected={selectedAgents}
                onDeleteSelected={handleDeleteSelected}
                disabledDelete={selectedAgents.ids?.size === 0}
            />
            <Box sx={{ width: '100%', p: 2 }} >
                <Tabs value={tab} onChange={handleTabChange} >
                    <Tab label="Agents" />
                    <Tab label="Enrollment Tokens" />
                </Tabs>
                <Box sx={{ mt: 1, display: tab === 0 ? 'block' : 'none' }}  >
                    
                        <AgentsGrid 
                            agents={agents}
                            loading={loading}
                            rowSelectionModel={selectedAgents}
                            onRowSelectionModelChange={(newSelection) => {
                                setSelectedAgents(newSelection);
                        }}
                    />
                    
                </Box>
                <Box sx={{ mt: 1, display: tab === 1 ? 'block' :'none' }}  >
                        <EnrollmentTokensGrid 
                            tokens={enrollmentTokens}
                            loading={loading}
                        />
                </Box>
            </Box>
            <AddAgentDialog 
                isDialogOpen={isTokenDialogOpen}
                handleCloseDialog={handleCloseDialog}
                newToken={newToken}
                handleCopy={handleCopy}
                copyStatus={copyStatus}
            />
        </Box>
    );

}