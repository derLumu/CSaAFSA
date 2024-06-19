import init from "./plugin";
import {analyseStatic} from "./analyseStatic";
import * as process from "node:process";
import { consola } from "consola";

// export the plugins init function
export = init;

// start commandline tool
if (process.argv.length != 3) {
    consola.error("Usage: node dist/index.js <path-to-backend>");
    process.exit(1);
}
const inputBE = process.argv[2];
analyseStatic(inputBE);