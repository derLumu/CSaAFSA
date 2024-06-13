import init from "./plugin";
import {analyseStatic} from "./analyseStatic";

// export the plugins init function
export = init;

// start commandline tool
const input = "D:/Java/werwolf-bot/digital-control-center/backend/src";
analyseStatic(input);