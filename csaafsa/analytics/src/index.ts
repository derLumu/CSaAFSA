import init from "./plugin";
import {analyseStatic} from "./analyseStatic";

// export the plugins init function
export = init;

// start commandline tool
const inputBE = "D:/Java/werwolf-bot/digital-control-center/backend/src";
const inputFE = "D:/Java/werwolf-bot/digital-control-center/frontend/src";
analyseStatic(inputBE, inputFE);