const fs = require("fs");
const lineByLine = require('n-readlines');

function writeChunk(chunkIndex, lines) {
    fs.writeFileSync(`./chunks/chunk${chunkIndex}.txt`, lines.sort().join("\n").trim());
}

function getChunks(chunkSize) {

    let counter = 0;
    let chunkCounter = 0;

    let lines = [];
    let chunks = [];

    const liner = new lineByLine('./test.txt');


    let rs;
    while(rs = liner.next()) {
        console.log(++counter, chunkCounter);
        if(lines.length < chunkSize) {
            lines.push(rs.toString());
        } else {
            writeChunk(++chunkCounter, lines);
            chunks.push({value: lines[0], chunk: chunkCounter});
            console.log(lines);
            lines = [rs.toString()];
        }
    }   

    if(lines.length > 0) {
        writeChunk(++chunkCounter, lines);
        chunks.push({value: lines[0], chunk: chunkCounter});
    }


    return chunks;
}


let chunks = getChunks(10);
fs.writeFileSync("./sorted.txt", "");

while(chunks.length > 1) {
    chunks.sort((a, b) => a.value < b.value ? -1 : 1);

    let smallest = chunks.shift();
    let next = chunks.shift();

    console.log(next);
    let reader = new lineByLine(`./chunks/chunk${smallest.chunk}.txt`);
    let val;

    let exhausted = true;

    while(val = reader.next()) {
        let v = val.toString();
        console.log(v, next.value, v <= next.value);
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
})

console.log(chunks);