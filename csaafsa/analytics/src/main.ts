import {FileAstGenerator} from "./extraction/fileAstGenerator";
import {filterDatatypeFromPath, filterDirectoryFromPath, walk} from "./extraction/directoryQuerier";
import {DatatypeExtractor} from "./extraction/datatypeExtractor";
import {MainDatatypeAnalyser} from "./analyseDatatype/mainDatatypeAnalyser";

const input = "./analytics/src/assets";
const mode = 'deep'

walk(input, (err, results) => {
    const asts = FileAstGenerator.generateAsts(results)
    const datatypes = asts.flatMap((ast) => DatatypeExtractor.extractDatatypes(ast.ast, ast.path))
    const mainDatatypeAnalyser = new MainDatatypeAnalyser()
    mainDatatypeAnalyser.analyseDatatypes(datatypes, mode)
}, filterDatatypeFromPath, filterDirectoryFromPath)
