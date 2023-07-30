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
        if(lines.length < chunkSize) {
            lines.push(rs.toString().trim());
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

function sortLargeFile(file_path, chunk_size, queue_size) {
    
    fs.rmSync("./chunks", {recursive: true, force: true});
    fs.mkdirSync("./chunks");

    let chunks = getChunks(file_path, chunk_size);
    fs.writeFileSync("./sorted.txt", "");

    let queue = [];

    let counter = 0;

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
            console.log(++counter, v <= next.value);
            console.log( `___${v}___`);
            console.log(`___${next.value}___`);
            console.log("###");
            if(v <= next.value) {
                // fs.appendFileSync("./sorted.txt", v+"\n");
                queue.push(v);
            }
            else {
                // let lines = [v];
                // while(val = reader.next()) {
                //     lines.push(val);
                // }
                // if(lines.length > 0)
                //     writeChunk(smallest.chunk, lines);
                // queue.push(v);

                chunks.push({value: v, chunk: smallest.chunk, rest: reader});
                chunks.push(next);
                exhausted = false;
                break;
            }
        }

        if(exhausted) {
            // writeChunk(smallest.chunk, []);
            chunks.push(next);
        }

        if(queue.length > queue_size) {
            queue.sort((a, b) => a.value < b.value ? -1 : 1);
            fs.appendFileSync("./sorted.txt", queue.join("\n")+"\n");
            queue = [];
        }

        // console.log(queue.length, process.memoryUsage().heapUsed / 1024 / 1024);
    }

    

    chunks.forEach(ch => {
        let reader = ch.rest || new lineByLine(`./chunks/chunk${ch.chunk}.txt`);
        queue.push(ch.value);
        let val;
        while(val = reader.next()) {
            queue.push(val.toString().trim());
        }
        // fs.appendFileSync("./sorted.txt", queue.join("\n")+"\n");
    });

    queue.sort((a, b) => a.value < b.value ? -1 : 1);
    fs.appendFileSync("./sorted.txt", queue.join("\n"));
}

export { sortLargeFile };