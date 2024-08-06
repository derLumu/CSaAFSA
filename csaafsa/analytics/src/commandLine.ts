#!/usr/bin/env node

// start commandline tool
import {consola} from "consola";
import {analyseStatic} from "./analyseStatic";

if (process.argv.length != 4) {
    consola.error("Usage: node dist/index.js <path-to-backend> <path-to-config>");
    process.exit(1);
}
const inputBE = process.argv[2];
const inputConfig = process.argv[3];
analyseStatic(inputBE, inputConfig);