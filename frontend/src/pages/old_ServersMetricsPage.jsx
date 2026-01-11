import { useState, useCallback, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
import { Box } from "@mui/material";
import ServerMetricsToolbar from "../components/ServerMetricsToolbar.jsx";
import ServerMetricsGrid from "../components/ServerMetricsGrid.jsx";
// import { fetchServerStats } from "../redux/thunks/metricsThunks.js";
import api from "../services/api.js";
import { logger } from "../utils/log.js";


export default function ServersMertricsPage() {

  const [ agents, setAgents ] = useState([]);
  const [ selectedAgents, setSelectedAgents ] = useState([]);
  const [ searchTerm, setSearchTerm ] = useState('');
  
  const [ rows, setRows ] = useState([]);
  const [ rowCount, setRowCount ] = useState(0);

  const [ page, setPage ] = useState(0);
  const [ pageSize, setPageSize ] = useState(20);
  const [ loading, setLoading ] = useState(false);

  useEffect(() => {
    async function loadAgnts() {
      const res = await api.get('/agents');
      // logger.info("ServersMertricsPage.jsx -> loadAgnts -> data:", data);
      console.log("ServersMertricsPage.jsx -> loadAgnts -> data:", res.data);
      setAgents(res.data);
    }
    loadAgnts();
  }, []);

  useEffect(() => {
    if ( agents.length > 0 && selectedAgents.length === 0 ) {
      const allAgentIds = agents.map((agent) => agent._id);
      console.log("ServersMertricsPage.jsx -> useEffect -> allAgentIds:", allAgentIds);
      // setSelectedAgents(allAgentIds);
      // console.log("ServersMertricsPage.jsx -> useEffect -> selectedAgents:", selectedAgents);
    }
  }, [agents, selectedAgents.length])

  const fetchMetrics = useCallback(async () => {
    console.log("ServersMertricsPage.jsx -> fetchMetrics -> selectedAgents:", selectedAgents);
    if (selectedAgents.length === 0) {
      setRows([]);
      setRowCount(0);
      return;
    }

    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page,
        pageSize,
        searchTerm,
      });

      selectedAgents.forEach((agentId) => params.append("agents", agentId));

      const res = await api.get(`/metrics?${params.toString()}`);
      console.log("ServersMertricsPage.jsx -> fetchMetrics -> res.data:", res.data);

      setRows(res.data.metrics);
      setRowCount(res.data.total);
    } catch (error) {
      logger.error("ServersMertricsPage.jsx -> fetchMetrics -> error:", error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedAgents, searchTerm, page, pageSize]);

  useEffect(() => {
    console.log("ServersMertricsPage.jsx -> useEffect -> fetchMetrics -> selectedAgents", selectedAgents);
    try {
      fetchMetrics();
    } catch (error) {
      logger.error("ServersMertricsPage.jsx -> useEffect -> fetchMetrics -> error:", error.message);
    }
  }, [fetchMetrics]);

  return (
    <Box sx={{ p: 2 }} >
      <ServerMetricsToolbar 
        agents={agents}
        selectedAgents={selectedAgents}
        onAgentFilterChange={setSelectedAgents}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setPage(0);
        }}
      />
      <ServerMetricsGrid 
        rows={rows}
        rowCount={rowCount}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

    </Box>
  )
  // return <div>Servers page (list of servers will go here)</div>;
}