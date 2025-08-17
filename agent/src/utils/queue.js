import fs from 'fs';
import path from 'path';


export class MemoryQueue {
    constructor( maxItem = 1000 ) {
        this.q = [];
        this.maxItem = maxItem;
    }
    push( item ) {
        this.q.push(item);
        if (this.q.length > this.maxItem) this.q.shift();
    }
    drain( max = Infinity ) {
        if ( max >= this.q.length ) {
            const all = this.q;
            this.q = [] ;
            return all
        }
        return this.q.splice( 0, max );
    }
    size() { return this.q.length; }
}

export class DiskQueue {
    constructor( dir ) {
        this.dir = dir;
        if ( !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        this.file = path.join( dir, 'queue.jsonl');
        if ( !fs.existsSync(this.file)) fs.writeFileSync(this.file, '');
    }
    push(item) {
        fs.appendFileSync(this.file, JSON.stringify(item) + '\n');
    }
    drain( max = 100 ) {
        const lines = fs.readFileSync( this.file, 'utf8').split('\n').filter(Boolean);
        const batch = lines.slice(0, max).map(l => JSON.parse(l));
        const remain = lines.slice(max);
        fs.writeFileSync(this.file, remain.join('\n') + (remain.length ? '\n' : ''));
        return batch
    }
    size () {
        try {
            return fs.readFileSync(this.file, 'utf8').split('\n').filter(Boolean).length;
        } catch { return 0; }
    }
}