import {walkSync} from "./extraction/directoryQuerier";
import {DatatypeExtractor} from "./extraction/datatypeExtractor";
import {MainDatatypeAnalyser} from "./analyseDatatype/mainDatatypeAnalyser";
import {EndpointExtractor} from "./extraction/endpointExtractor";
import {MainEndpointAnalyser} from "./analyseEndpoint/mainEndpointAnalyser";
import ts from "typescript/lib/tsserverlibrary";
//import { consola } from "consola";


function main(input: string, projectFiles: string[] = []): ts.Diagnostic[] {
    //consola.start("Starting analysis")
    if (projectFiles.length == 0) {
        projectFiles = walkSync(input) // TODO: OS dependant?
    }
    projectFiles = projectFiles.map((f) => f.replace(/\\/g, "/"))
    const program = ts.createProgram(projectFiles, {});
    const checker = program.getTypeChecker();

    //consola.success("Fetched the project")
    //consola.start("Starting datatype analysis")

    // get instances of the analysers
    const mainDatatypeAnalyser = new MainDatatypeAnalyser()
    const mainEndpointAnalyser = new MainEndpointAnalyser()

    // handle datatypes
    const datatypes = DatatypeExtractor.extractDatatypes(program, checker, projectFiles)
    let diagnostics: ts.Diagnostic[] = mainDatatypeAnalyser.analyseDatatypes(datatypes, "deep")

    //consola.success("Datatype analysis done")
    //consola.start("Starting endpoint analysis")

    // handle endpoints
    const endpoints = EndpointExtractor.extractEndpoints(program, projectFiles, checker)
    diagnostics = diagnostics.concat(...mainEndpointAnalyser.analyseEndpoints(endpoints, checker, projectFiles, "deep"))

    //consola.success("Endpoint analysis done. We are done!");

    return diagnostics
}

function init(modules: { typescript: typeof import("typescript/lib/tsserverlibrary") }) {
    const ts = modules.typescript;

    function create(info: ts.server.PluginCreateInfo) {

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

            const diagnostics = main(filename, info.languageService.getProgram()?.getRootFileNames() as string[])
                .filter(d => d.file.fileName === filename);

            return prior.concat(diagnostics);
        }
        return proxy;
    }

    return { create };
}

export = init;

// use next lines when using serve
const input = "D:/Java/werwolf-bot/digital-control-center/backend/src";
const diagnostics = main(input);