import {walkSync} from "./extraction/directoryQuerier";
import {MainDatatypeAnalyser} from "./analyseDatatype/mainDatatypeAnalyser";
import {MainEndpointAnalyser} from "./analyseEndpoint/mainEndpointAnalyser";
import {DatatypeExtractor} from "./extraction/datatypeExtractor";
import {EndpointExtractor} from "./extraction/endpointExtractor";
import ts from "typescript/lib/tsserverlibrary";
import { consola } from "consola";

export function analyseStatic(input: string, projectFiles: string[] = []): void {
    consola.start("Starting analysis")
    if (projectFiles.length == 0) {
        projectFiles = walkSync(input)
    }
    projectFiles = projectFiles.map((f) => f.replace(/\\/g, "/"))
    const program = ts.createProgram(projectFiles, {});
    const checker = program.getTypeChecker();

    consola.success("Fetched the project")
    consola.start("Starting datatype analysis")

    // get instances of the analysers
    const mainDatatypeAnalyser = new MainDatatypeAnalyser()
    const mainEndpointAnalyser = new MainEndpointAnalyser()

    // handle datatypes
    const datatypes = DatatypeExtractor.extractDatatypes(program, checker, projectFiles)
    mainDatatypeAnalyser.analyseDatatypes(datatypes, "deep")
    mainDatatypeAnalyser.outputResults()

    consola.success("Datatype analysis done")
    consola.start("Starting endpoint analysis")

    // handle endpoints
    const endpoints = EndpointExtractor.extractEndpoints(program, projectFiles, checker)
    mainEndpointAnalyser.analyseEndpoints(endpoints, checker, projectFiles, "deep")
    mainEndpointAnalyser.outputResults()

    consola.success("Endpoint analysis done. We are done!");
}

export function analyseDynamic(input: string, projectFiles: string[] = []): ts.Diagnostic[] {
    projectFiles = projectFiles.map((f) => f.replace(/\\/g, "/"))
    const program = ts.createProgram(projectFiles, {});
    const checker = program.getTypeChecker();

    // get instances of the analysers
    const mainDatatypeAnalyser = new MainDatatypeAnalyser()
    const mainEndpointAnalyser = new MainEndpointAnalyser()

    // handle datatypes
    const datatypes = DatatypeExtractor.extractDatatypes(program, checker, projectFiles)
    let diagnostics: ts.Diagnostic[] = mainDatatypeAnalyser.analyseDatatypes(datatypes, "deep")

    // handle endpoints
    const endpoints = EndpointExtractor.extractEndpoints(program, projectFiles, checker)
    diagnostics = diagnostics.concat(...mainEndpointAnalyser.analyseEndpoints(endpoints, checker, projectFiles, "deep"))

    return diagnostics
}