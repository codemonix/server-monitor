import { useEffect, useState } from "react";
import api from "../services/api.js";
import { socket } from "../services/socket.js";

export default function useServerStats(serverId) {
    const [ stats, setStats ] = useState(null);

    useEffect(() => {
        async function fetchInitial() {
            const { data } = await api.get(`/servers/${serverId}/stats`);
            setStats(data);
        }
        fetchInitial();

        socket.emit("subscribe", serverId);
        socket.on("statsUpdate", (update) => {
            if (update.serverId === serverId) {
                setStats(update.stats);
            }
        });

        return () => {
            socket.emit("unsubscribe", serverId);
            socket.off("statsUpdate");
        }
    }, [serverId]);
    return stats;
}