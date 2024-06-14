import {walkSync} from "./extraction/directoryQuerier";
import {MainDatatypeAnalyser} from "./analyseDatatype/mainDatatypeAnalyser";
import {MainEndpointAnalyser} from "./analyseEndpoint/mainEndpointAnalyser";
import {DatatypeExtractor} from "./extraction/datatypeExtractor";
import {EndpointExtractor} from "./extraction/endpointExtractor";
import ts from "typescript/lib/tsserverlibrary";
import { consola } from "consola";
import {ApiCallExtractor} from "./extraction/apiCallExtractor";
import fs from "fs";
import {ApiCall} from "./extraction/model/endpoint";
import {CONFIG_FILE_NAME} from "./analyseEndpoint/exceptionEndpointAnalyser";

export function analyseStatic(inputBE: string, inputFE: string): void {
    consola.start("Starting analysis")

    let frontendFiles = walkSync(inputFE)
    frontendFiles = frontendFiles.map((f) => f.replace(/\\/g, "/"))
    const programFE = ts.createProgram(frontendFiles, {});
    const checkerFE = programFE.getTypeChecker();

    const apiCallExtractor = new ApiCallExtractor()
    const apiCalls = apiCallExtractor.extractApiCalls(programFE, frontendFiles, checkerFE)

    let backendFiles = walkSync(inputBE)
    backendFiles = backendFiles.map((f) => f.replace(/\\/g, "/"))
    const program = ts.createProgram(backendFiles, {});
    const checker = program.getTypeChecker();

    consola.success("Fetched the project")
    consola.start("Starting datatype analysis")

    // get instances of the analysers
    const mainDatatypeAnalyser = new MainDatatypeAnalyser()
    const mainEndpointAnalyser = new MainEndpointAnalyser()

    // handle datatypes
    const datatypes = DatatypeExtractor.extractDatatypes(program, checker, backendFiles)
    mainDatatypeAnalyser.analyseDatatypes(datatypes, "deep")
    mainDatatypeAnalyser.outputResults()

    consola.success("Datatype analysis done")
    consola.start("Starting endpoint analysis")

    // handle endpoints
    const endpoints = EndpointExtractor.extractEndpoints(program, backendFiles, checker)
    mainEndpointAnalyser.analyseEndpoints(endpoints, checker, backendFiles, apiCalls, "deep")
    mainEndpointAnalyser.outputResults()

    consola.success("Endpoint analysis done. We are done!");
}

export function analyseDynamic(input: string, projectFiles: string[] = []): ts.Diagnostic[] {
    let apiCalls: ApiCall[] = []
    if (1 == 1) {
        //TODO: find a way to read the config file
        const configFile = fs.readFileSync("D:/Java/CSaAFSA/csaafsa/dist/analytics/src/config.json", 'utf-8');
        const config = JSON.parse(configFile)
        if (!config.frontendPath) {
            return
        }
        let frontendFiles = walkSync(config.frontendPath)
        frontendFiles = frontendFiles.map((f) => f.replace(/\\/g, "/"))
        const programFE = ts.createProgram(frontendFiles, {});
        const checkerFE = programFE.getTypeChecker();

        const apiCallExtractor = new ApiCallExtractor()
        apiCalls = apiCallExtractor.extractApiCalls(programFE, frontendFiles, checkerFE)
    }

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
    diagnostics = diagnostics.concat(...mainEndpointAnalyser.analyseEndpoints(endpoints, checker, projectFiles, apiCalls, "deep"))

    return diagnostics
}