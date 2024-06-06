import {filterDatatypeFromPath, filterDirectoryFromPath, walk} from "./extraction/directoryQuerier";
import {DatatypeExtractor} from "./extraction/datatypeExtractor";
import {MainDatatypeAnalyser} from "./analyseDatatype/mainDatatypeAnalyser";

import ts from 'typescript';
import {EndpointExtractor} from "./extraction/endpointExtractor";
import {MainEndpointAnalyser} from "./analyseEndpoint/mainEndpointAnalyser";

//TODO: remove hardcoded input at some point...
const input = "D:/Java/werwolf-bot/digital-control-center/backend/src";
//const input = "./analytics/src/assets";
const mode = 'deep'

walk(input, (err, projectFiles) => {
    projectFiles = projectFiles.map((f) => f.replace(/\\/g, "/")) // TODO: OS dependant?
    const program = ts.createProgram(projectFiles, {});
    const checker = program.getTypeChecker();

    // handle datatypes
    const datatypes = DatatypeExtractor.extractDatatypes(program, checker, projectFiles)
    const mainDatatypeAnalyser = new MainDatatypeAnalyser()
    mainDatatypeAnalyser.analyseDatatypes(datatypes, mode)

    // handle endpoints
    const endpoints = EndpointExtractor.extractEndpoints(program, projectFiles)
    const mainEndpointAnalyser = new MainEndpointAnalyser()
    mainEndpointAnalyser.analyseEndpoints(endpoints, checker, projectFiles, mode)
}, filterDatatypeFromPath, filterDirectoryFromPath)