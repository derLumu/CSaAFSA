import {getSemanticDiagnostics} from "./semanticDiagnostics";
import {EXCEPTIONS_REFACTOR_NAME, getApplicableRefactors, UPDATE_DTO_REFACTOR_NAME} from "./applicableRefactors";
import {getEditsForDTORefactor, getEditsForExceptionRefactor} from "./editsForRefactor";

function init(modules: { typescript: typeof import("typescript/lib/tsserverlibrary") }) {
    //@ts-ignore
    const ts = modules.typescript;

    function create(info: ts.server.PluginCreateInfo) {
        const configPath = info.config.configPath || "";
        info.project.projectService.logger.info(
            `Using config path ${configPath}`
        );
        // create a proxy for the service
        const proxy: ts.LanguageService = Object.create(null);
        for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
            const x = info.languageService[k]!;
            proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
        }
        // Add custom service responses
        proxy.getSemanticDiagnostics = (filename) => {
            const prior = info.languageService.getSemanticDiagnostics(filename);
            const program = info.languageService.getProgram();
            if (!program) { return prior }
            return getSemanticDiagnostics(prior, program.getRootFileNames() as string[], configPath, filename);
        }
        proxy.getApplicableRefactors = (fileName, positionOrRange, preferences) => {
            const prior = info.languageService.getApplicableRefactors(fileName, positionOrRange, preferences);
            const sourceFile = info.languageService.getProgram()?.getSourceFile(fileName);
            return [...prior, getApplicableRefactors(sourceFile, positionOrRange, configPath)];
        }
        proxy.getEditsForRefactor = (fileName, formatOptions, positionOrRange, refactorName, actionName, preferences) => {
            switch (refactorName) {
                case UPDATE_DTO_REFACTOR_NAME:
                    return getEditsForDTORefactor(positionOrRange, info.languageService.getProgram()?.getSourceFile(fileName)!, fileName)
                case EXCEPTIONS_REFACTOR_NAME:
                    return getEditsForExceptionRefactor(positionOrRange, info.languageService.getProgram()?.getSourceFile(fileName)!, fileName, configPath)
                default:
                    return info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName, preferences);
            }
        }
        return proxy;
    }
    return { create };
}

export = init;