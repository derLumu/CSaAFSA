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

export function analyseStatic(inputBE: string, inputConfig: string): void {
    consola.start("Starting analysis")

    const apiCalls = getApiCalls(inputConfig, true)
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
    mainDatatypeAnalyser.analyseDatatypes(datatypes)
    mainDatatypeAnalyser.outputResults()

    consola.success("Datatype analysis done")
    consola.start("Starting endpoint analysis")

    // handle endpoints
    const endpoints = EndpointExtractor.extractEndpoints(program, backendFiles)
    mainEndpointAnalyser.analyseEndpoints(endpoints, checker, apiCalls, inputConfig)
    mainEndpointAnalyser.outputResults()

    consola.success("Endpoint analysis done. We are done!");
}

export function analyseDynamic(configPath: string, projectFiles: string[] = []): ts.Diagnostic[] {
    const apiCalls = getApiCalls(configPath, false)
    projectFiles = projectFiles.map((f) => f.replace(/\\/g, "/"))
    const program = ts.createProgram(projectFiles, {});
    const checker = program.getTypeChecker();

    // get instances of the analysers
    const mainDatatypeAnalyser = new MainDatatypeAnalyser()
    const mainEndpointAnalyser = new MainEndpointAnalyser()

    // handle datatypes
    const datatypes = DatatypeExtractor.extractDatatypes(program, checker, projectFiles)
    let diagnostics: ts.Diagnostic[] = mainDatatypeAnalyser.analyseDatatypes(datatypes)

    // handle endpoints
    const endpoints = EndpointExtractor.extractEndpoints(program, projectFiles)
    diagnostics = diagnostics.concat(...mainEndpointAnalyser.analyseEndpoints(endpoints, checker, apiCalls, configPath))

    return diagnostics
}

function getApiCalls(configPath: string, logging: boolean): ApiCall[] {
    try {
        const configFile = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configFile)
        if (config.frontendPath) {
            let frontendFiles = walkSync(config.frontendPath)
            frontendFiles = frontendFiles.map((f) => f.replace(/\\/g, "/"))
            const programFE = ts.createProgram(frontendFiles, {});
            const checkerFE = programFE.getTypeChecker();

            const apiCallExtractor = new ApiCallExtractor()
            return apiCallExtractor.extractApiCalls(programFE, frontendFiles, checkerFE)
        }
    } catch (e) {
        if (logging) { consola.warn("Could not read the config file. Skipping frontend analysis.") }
    }
    return []
}