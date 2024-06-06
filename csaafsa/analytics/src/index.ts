import {walkSync} from "./extraction/directoryQuerier";
import {DatatypeExtractor} from "./extraction/datatypeExtractor";
import {MainDatatypeAnalyser} from "./analyseDatatype/mainDatatypeAnalyser";
import {EndpointExtractor} from "./extraction/endpointExtractor";
import {MainEndpointAnalyser} from "./analyseEndpoint/mainEndpointAnalyser";

/*
const input = "D:/Java/werwolf-bot/digital-control-center/backend/src";

function main(input: string) {
    const projectFiles = walkSync(input).map((f) => f.replace(/\\/g, "/")) // TODO: OS dependant?
    const program = ts.createProgram(projectFiles, {});
    const checker = program.getTypeChecker();

    // handle datatypes
    const datatypes = DatatypeExtractor.extractDatatypes(program, checker, projectFiles)
    const mainDatatypeAnalyser = new MainDatatypeAnalyser()
    mainDatatypeAnalyser.analyseDatatypes(datatypes, "deep")

    // handle endpoints
    const endpoints = EndpointExtractor.extractEndpoints(program, projectFiles)
    const mainEndpointAnalyser = new MainEndpointAnalyser()
    mainEndpointAnalyser.analyseEndpoints(endpoints, checker, projectFiles, "deep")
}
main(input);
 */


function init(modules: { typescript: typeof import("typescript/lib/tsserverlibrary") }) {
    const ts = modules.typescript;

    function create(info: ts.server.PluginCreateInfo) {
        // Get a list of things to remove from the completion list from the config object.
        // If nothing was specified, we'll just remove 'caller'
        const whatToRemove: string[] = info.config.remove || ["caller"];

        // Set up decorator object
        const proxy: ts.LanguageService = Object.create(null);
        for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
            const x = info.languageService[k]!;
            proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
        }

        // Remove specified entries from completion list
        proxy.getCompletionsAtPosition = (fileName, position, options) => {
            const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
            if (!prior) return
            prior.entries.push({ name: "testThePlugin", kind: ts.ScriptElementKind.keyword, kindModifiers: ts.ScriptElementKindModifier.none, sortText: "0" });

            return prior;
        };

        return proxy;
    }

    return { create };
}

export = init;