import osu from 'node-os-utils';

export async function getSystemMetrics() {
    const cpu = await osu.cpu.usage();
    const memInfo = await osu.mem.info();
    const osInfo = await osu.os.oos();

    return {
        cpu: Number(cpu.toFixed(2)),
        ram: Number(memInfo.usedMemPercentage.toFixed(2)),
        uptime: (await osu.os.uptime())
    };
}