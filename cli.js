#!/usr/bin/env node
const fs = require("node:fs");
const { run } = require("./evaluator.js");





const filename = process.argv[2];

if (!filename) {
    console.error("Usage: egg <filename.egg>");
    process.exit(1);
}

const source = fs.readFileSync(filename, "utf8");

run(source);