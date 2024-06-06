import {walkSync} from "./extraction/directoryQuerier";
import {DatatypeExtractor} from "./extraction/datatypeExtractor";
import {MainDatatypeAnalyser} from "./analyseDatatype/mainDatatypeAnalyser";
import {EndpointExtractor} from "./extraction/endpointExtractor";
import {MainEndpointAnalyser} from "./analyseEndpoint/mainEndpointAnalyser";
import ts from "typescript/lib/tsserverlibrary";
import { consola, createConsola } from "consola";

const input = "D:/Java/werwolf-bot/digital-control-center/backend/src";

function main(input: string, program: ts.Program = undefined): ts.Diagnostic[] {
    consola.start("Starting analysis")
    const projectFiles = walkSync(input).map((f) => f.replace(/\\/g, "/")) // TODO: OS dependant?
    !program && (program = ts.createProgram(projectFiles, {}));
    const checker = program.getTypeChecker();

    consola.success("Fetched the project")
    consola.start("Starting datatype analysis")

    // handle datatypes
    const datatypes = DatatypeExtractor.extractDatatypes(program, checker, projectFiles)
    const mainDatatypeAnalyser = new MainDatatypeAnalyser()
    let diagnostics: ts.Diagnostic[] = mainDatatypeAnalyser.analyseDatatypes(datatypes, "deep")

    consola.success("Datatype analysis done")
    consola.start("Starting endpoint analysis")

    // handle endpoints
    const endpoints = EndpointExtractor.extractEndpoints(program, projectFiles)
    const mainEndpointAnalyser = new MainEndpointAnalyser()
    diagnostics = diagnostics.concat(...mainEndpointAnalyser.analyseEndpoints(endpoints, checker, projectFiles, "deep"))

    consola.success("Endpoint analysis done. We are done!");

    return diagnostics
}

const diagnostics = main(input);


function init(modules: { typescript: typeof import("typescript/lib/tsserverlibrary") }) {
    const ts = modules.typescript;

    function create(info: ts.server.PluginCreateInfo) {
        // Get a list of things to remove from the completion list from the config object.
        // If nothing was specified, we'll just remove 'caller'

        // Set up decorator object
        const proxy: ts.LanguageService = Object.create(null);
        for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
            const x = info.languageService[k]!;
            proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
        }

        proxy.getSemanticDiagnostics = (filename) => {
            const prior = info.languageService.getSemanticDiagnostics(filename);
            const program = info.languageService.getProgram();
            if (!program) {
                return prior;
            }

            const diagnostics = main(filename, program);
            return [...prior, ...diagnostics];
        }

        return proxy;
    }

    return { create };
}

export = init;