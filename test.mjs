import fs from "fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { sortLargeFile } from "./merge.mjs";

test('sorting large file test', (t) => {
    const TEST_FILE = "./tests/20230730120749_7701.csv";

    sortLargeFile(TEST_FILE, 5); 

    let lines = fs.readFileSync("./sorted.txt").toString().split("\n");

    assert.equal(lines[0], `"Abraham","Edwards","a.edwards@randatmail.com","844-1672-85","Primary","Actor"`);
    assert.equal(lines[lines.length-2], `"William","Thompson","w.thompson@randatmail.com","887-1689-78","Doctoral","Insurer"`);
});