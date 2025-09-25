import { use, useEffect, useMemo, useRef, useState } from "react";
import { getServerMetrics } from "../services/api.js";
import { logger } from "../utils/log.js";

const WS_BASE = (window?.config?.WS_BASE) || ( (window?.config?.API_BASE || import.meta.env.VITE_API_BASE || 'http://localhost:4000').replace(/^http/, 'ws') )


export default function useLiveMetrics(server) {
    const [ points, setPoints ] = useState([]);
    const [ lastTs, setLastTs ] = useState(0);
    const [ source, setSource ] = useState('ws');

    const wsUrl = useMemo(() => {
        if (!server) return null;
        if (server.ws) return server.ws;
        const u = new URL(`${WS_BASE}/ws/metrics`);
        u.searchParams.set('serverId', server.id);
        return u.toString();
    }, [server]);

    const wsRef = useRef(null);
    const firstMsgTimeRef = useRef(0);
    const reconnectRef = useRef(0);
    const timerRef = useRef(null);

    function push(point) {
        setPoints( prev => {
            const next = [ ...prev, point ].slice(-600);
            return next;
        })
        if (point?.ts) setLastTs(point.ts);
    }

    useEffect(() => {
        firstMsgTimeRef.current = 0;
    },[server?.id]);

    useEffect(() => {
        if (!server || !wsUrl) return;
        let mounted = true;

        function connect() {
            try {
                const ws = new WebSocket(wsUrl);
                wsRef.current = ws;
                ws.onopen = () => { reconnectRef.current = 0; };
                ws.onmessage = (ev) => {
                    if (!mounted) return;
                    try {
                        const msg = JSON.parse(ev.data);
                        firstMsgTimeRef.current = firstMsgTimeRef.current || Date.now();
                        setSource('ws');
                        push(msg);
                    } catch (error) {
                        logger.error('Error parsing WebSocket message', error);
                    }
                }
                ws.onclose = () => scheduleReconnect();
                ws.onerror = () => { try { ws.close(); } catch (err) { logger.error('WebSocket error', err); }};
            } catch {
                scheduleReconnect();
            }
        }

        function scheduleReconnect() {
            const attempt = Math.min( 6, reconnectRef.current + 1 );
            reconnectRef.current = attempt;
            const delay = attempt * 1000;
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(connect, delay);
        }
        connect();

        return () => {
            mounted = false;
            clearTimeout(timerRef.current);
            try { wsRef.current && wsRef.current.close(); } catch (err) { logger.error('Error closing WebSocket', err); }
        }

    }, [wsUrl, server])

    //API polling fall back or top-up
    useEffect(() => {
        if(!server) return;
        let cancelled = false;
        async function poll() {
            try {
                const data = await getServerMetrics(server.id. lastTs);
                if ( cancelled || data?.point?.length ) return
                setSource( s => ( s === 'ws' ? s : 'api' ));
                for ( const p of data.points ) push(p);
            } catch (error) {
                if (!cancelled) logger.error('Error fetching server metrics', error);
            }
        }

        const start = setTimeout(() => {
            if (!firstMsgTimeRef.current) poll();
        }, 5000)

        const t = setInterval( poll, 4000 );
        return () => { clearTimeout(start); clearInterval(t); cancelled = true; }
    }, [server, lastTs])

    return { points, source }

}