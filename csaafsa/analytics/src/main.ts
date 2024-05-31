import {filterDatatypeFromPath, filterDirectoryFromPath, walk} from "./extraction/directoryQuerier";
import {DatatypeExtractor} from "./extraction/datatypeExtractor";
import {MainDatatypeAnalyser} from "./analyseDatatype/mainDatatypeAnalyser";

import * as ts from 'typescript';
import {EndpointExtractor} from "./extraction/endpointExtractor";
import {MainEndpointAnalyser} from "./analyseEndpoint/mainEndpointAnalyser";

const input = "D:/Java/werwolf-bot/digital-control-center/backend/src/objects";
//const input = "./analytics/src/assets";
const mode = 'deep'

walk(input, (err, projectFiles) => {
    const program = ts.createProgram(projectFiles, {});
    const checker = program.getTypeChecker()

    // handle datatypes
    const datatypes = DatatypeExtractor.extractDatatypes(program, checker, projectFiles)
    const mainDatatypeAnalyser = new MainDatatypeAnalyser()
    mainDatatypeAnalyser.analyseDatatypes(datatypes, mode)

    // handle endpoints
    const endpoints = EndpointExtractor.extractEndpoints(program, checker, projectFiles)
    const mainEndpointAnalyser = new MainEndpointAnalyser()
    mainEndpointAnalyser.analyseEndpoints(endpoints, mode)
}, filterDatatypeFromPath, filterDirectoryFromPath)