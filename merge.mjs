import fs from "fs";
import lineByLine from "n-readlines";

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
        let v = rs.toString().trim();
        if(lines.length < chunkSize) {
            lines.push(v);
        } else {
            writeChunk(++chunkCounter, lines);
            chunks.push({value: lines[0], chunk: chunkCounter});
            lines = [v];
        }
    }   

    if(lines.length > 0) {
        writeChunk(++chunkCounter, lines);
        chunks.push({value: lines[0], chunk: chunkCounter});
    }

    return chunks;
}

function sortLargeFile(file_path, chunk_size, queue_size) {
    
    fs.rmSync("./chunks", {recursive: true, force: true});
    fs.mkdirSync("./chunks");

    let chunks = getChunks(file_path, chunk_size);
    fs.writeFileSync("./sorted.txt", "");

    let queue = [];

    while(chunks.length > 1) {
        chunks.sort((a, b) => a.value < b.value ? -1 : 1);

        let smallest = chunks.shift();
        let next = chunks.shift();

        let reader = smallest.rest;
        if(!reader) {
            reader = new lineByLine(`./chunks/chunk${smallest.chunk}.txt`);
            reader.next();
        }
        let val;
        let exhausted = true;
        queue.push(smallest.value);
        
        while(val = reader.next()) {
            let v = val.toString().trim();
            if(v <= next.value) {
                queue.push(v);
            }
            else {
                chunks.push({value: v, chunk: smallest.chunk, rest: reader});
                chunks.push(next);
                exhausted = false;
                break;
            }
        }

        if(exhausted) {
            chunks.push(next);
        }

        if(queue.length > queue_size) {
            queue.sort((a, b) => a.value < b.value ? -1 : 1);
            fs.appendFileSync("./sorted.txt", queue.join("\n")+"\n");
            queue = [];
        }
    }

    chunks.forEach(ch => {
        let reader = ch.rest || new lineByLine(`./chunks/chunk${ch.chunk}.txt`);
        queue.push(ch.value);
        let val;
        while(val = reader.next()) {
            queue.push(val.toString().trim());
        }
    });

    queue.sort((a, b) => a.value < b.value ? -1 : 1);
    fs.appendFileSync("./sorted.txt", queue.join("\n"));
}

export { sortLargeFile };