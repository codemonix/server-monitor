import si from 'systeminformation';
import os from 'os';



let lastNetworkMetrics = {
    ts: 0,
    rx_bytes: 0,
    tx_bytes: 0,
}

export async function collectSystemMetrics() {
    const [cpu, mem, disk, net, time ] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.time(),
    ]);

    const [load1, load5, load15] = os.loadavg();

    const currectTs = Date.now();
    const currentNet = net[0] || { rx_bytes: 0, tx_bytes: 0 }
    
    let rx_kbps = 0;
    let tx_kbps = 0;

    if (lastNetworkMetrics.ts > 0) {
        const timeDiffMs = currectTs - lastNetworkMetrics.ts;
        const timeDiffS = timeDiffMs / 1000;

        const rx_bytes_diff = currentNet.rx_bytes - lastNetworkMetrics.rx_bytes;
        const tx_bytes_diff = currentNet.tx_bytes - lastNetworkMetrics.tx_bytes;

        const rx_Bps = rx_bytes_diff / timeDiffS;
        const tx_Bps = tx_bytes_diff / timeDiffS;

        rx_kbps = (rx_Bps * 8) / 1024;
        tx_kbps = (tx_Bps * 8) / 1024;
    }

    lastNetworkMetrics = {
        ts: currectTs,
        rx_bytes: currentNet.rx_bytes,
        tx_bytes: currentNet.tx_bytes,
    }

    return {
        ts: new Date(),
        cpu: cpu.currentLoad ,
        memUsed: mem.used,
        memTotal: mem.total,
        diskUsed: disk[0] ? disk[0].used : 0,
        diskTotal: disk[0] ? disk[0].size : 0,
        rx: rx_kbps,
        tx: tx_kbps,
        upTime: time.uptime,
        load1,
        load5,
        load15,
    };
}