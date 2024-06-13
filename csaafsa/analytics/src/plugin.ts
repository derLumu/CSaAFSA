import {analyseDynamic} from "./analyseStatic";

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

            const diagnostics = analyseDynamic(filename, info.languageService.getProgram()?.getRootFileNames() as string[])
                .filter(d => d.file.fileName === filename);

            return prior.concat(diagnostics);
        }
        return proxy;
    }

    return { create };
}

export = init;