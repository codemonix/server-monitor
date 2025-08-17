import si from 'systeminformation';


export async function collectSnapshot() {
    const [ load, mem, fs, net, time, osInfo ] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.time(),
        si.osInfo()
    ]);

    const disks = fs.map( d => ({ fs: d.fs, type: d.type, size: d.size, used: d.used, use: d.use }));

    return {
        ts: new Date().toDateString(),
        system: {
            hostname: osInfo.hostname,
            platform: osInfo.platform,
            distro: osInfo.distro,
            release: osInfo.release,
            uptime: time.uptime,
            cpu: Number(load.currentLoad.toFixed(2)),
            ram: Number((( mem.used / mem.total ) *100 ).toFixed(2)),
            ramUsed: mem.used,
            ramTotal: mem.total,
            disks
        },
        network: {
            interfaces: net.map( n => ({ iface: n.iface, rx_sec: n.rx_sec, tx_sec: n.tx_sec })),
            totalRxSec: net.reduce(( s, n ) => s + ( n.rx_sec || 0 ), 0 ),
            totalTxSec: net.reduce(( s, n ) => s + ( n.tx_sec || 0 ), 0 ),
        }
    };
}