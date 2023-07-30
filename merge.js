const fs = require("fs");
const lineByLine = require('n-readlines');

const CHUNK_SIZE = process.env.CHUNK_SIZE || 5;

function writeChunk(chunkIndex, lines) {
    fs.writeFileSync(`./chunks/chunk${chunkIndex}.txt`, lines.sort().join("\n").trim());
}

function getChunks(to_sort, chunkSize) {
    let chunkCounter = 0;
    let lines = [];
    let chunks = [];

    const liner = new lineByLine(to_sort);

    let rs;
    while(rs = liner.next()) {
        if(lines.length < chunkSize) {
            lines.push(rs.toString());
        } else {
            writeChunk(++chunkCounter, lines);
            chunks.push({value: lines[0], chunk: chunkCounter});
            lines = [rs.toString()];
        }
    }   

    if(lines.length > 0) {
        writeChunk(++chunkCounter, lines);
        chunks.push({value: lines[0], chunk: chunkCounter});
    }

    return chunks;
}

function sortLargeFile(file_path) {
    let chunks = getChunks(file_path, CHUNK_SIZE);
    fs.writeFileSync("./sorted.txt", "");

    while(chunks.length > 1) {
        chunks.sort((a, b) => a.value < b.value ? -1 : 1);

        let smallest = chunks.shift();
        let next = chunks.shift();

        let reader = new lineByLine(`./chunks/chunk${smallest.chunk}.txt`);
        let val;

        let exhausted = true;

        while(val = reader.next()) {
            let v = val.toString();
            if(v <= next.value) {
                fs.appendFileSync("./sorted.txt", v+"\n");
            }
            else {
                let lines = [v];
                while(val = reader.next()) {
                    lines.push(val);
                }
                if(lines.length > 0)
                    writeChunk(smallest.chunk, lines);

                chunks.push({value: v, chunk: smallest.chunk});
                chunks.push(next);
                exhausted = false;
                break;
            }
        }

        if(exhausted) {
            writeChunk(smallest.chunk, []);
            chunks.push(next);
        }
    }

    chunks.forEach(ch => {
        let reader = new lineByLine(`./chunks/chunk${ch.chunk}.txt`);
        while(val = reader.next()) {
            let v = val.toString().trim();
            fs.appendFileSync("./sorted.txt", v+"\n");
        }
    });
}
