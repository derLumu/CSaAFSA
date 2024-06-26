// start commandline tool
import {consola} from "consola";
import {analyser} from "./analyser";

if (process.argv.length != 3) {
    consola.error("Usage: node dist/index.js <path-to-backend>");
    process.exit(1);
}
const inputBE = process.argv[2];
analyser(inputBE);