import { useEffect, useState } from "react";
import api from "../services/api.js";

/** Loads server stats over HTTP (live socket channel not implemented for this hook). */
export default function useServerStats(serverId: string | undefined) {
    const [stats, setStats] = useState<unknown>(null);

    useEffect(() => {
        if (!serverId) return;

        async function fetchInitial() {
            const { data } = await api.get(`/servers/${serverId}/stats`);
            setStats(data);
        }
        void fetchInitial();
    }, [serverId]);

    return stats;
}
