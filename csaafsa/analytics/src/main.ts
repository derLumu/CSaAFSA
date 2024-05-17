import {FileAstGenerator} from "./fileAstGenerator";
import {filterDatatypeFromPath, walk} from "./directoryQuerier";
import {DatatypeExtractor} from "./datatypeExtractor";

const input = "./analytics/src/assets";

walk(input, (err, results) => {
    const asts = FileAstGenerator.generateAsts(results)
    const datatypes = asts.flatMap((ast) => DatatypeExtractor.extractDatatypes(ast))
    console.log(datatypes)
}, filterDatatypeFromPath)