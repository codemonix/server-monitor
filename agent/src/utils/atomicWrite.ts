
import fs from "fs/promises";
import path from "path";

export async function atomicWrite(
    filePath: string,
    data: string | NodeJS.ArrayBufferView,
    { encoding = "utf8" as NodeJS.BufferEncoding, mode = 0o600 } = {}
) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    const tmp = `${filePath}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, data, { encoding, mode: 0o600 });
    await fs.rename(tmp, filePath);
    try {
        await fs.chmod(filePath, mode);
    } catch (error) {
        console.warn(`chmode warning on ${filePath}:`, error.message);
    }
}