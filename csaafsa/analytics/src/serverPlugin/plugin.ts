import {analyseDynamic} from "../analyseStatic";
import {DatatypeExtractor} from "../extraction/datatypeExtractor";
import {getSemanticDiagnostics} from "./semanticDiagnostics";

function init(modules: { typescript: typeof import("typescript/lib/tsserverlibrary") }) {
    const ts = modules.typescript;

    function create(info: ts.server.PluginCreateInfo) {

        // Diagnostic logging
        info.project.projectService.logger.info(
            `Creating Plugin Analytics`
        );

        const configPath = info.config.configPath || "";

        // Diagnostic logging
        info.project.projectService.logger.info(
            `Using config path ${configPath}`
        );

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
            return getSemanticDiagnostics(prior, program.getRootFileNames() as string[], configPath, filename);
        }

        proxy.getApplicableRefactors = (fileName, positionOrRange, preferences) => {
            const prior = info.languageService.getApplicableRefactors(fileName, positionOrRange, preferences);

            const position = typeof positionOrRange === "number" ? positionOrRange : positionOrRange.pos;
            const classOfCaller = DatatypeExtractor.getParentClassFromPosition(position, info.languageService.getProgram()?.getSourceFile(fileName));
            const reason = classOfCaller ? undefined : "No class found at the current position";

            const testRefactor: ts.ApplicableRefactorInfo = {
                name: "Generate Update",
                description: "Generate Update DTO",
                actions: [{
                    name: "Generate Update",
                    description: "Generate Update DTO",
                    kind: "analytical.generateUpdateDTO",
                    notApplicableReason: reason
                }]
            }

            return [...prior, testRefactor];
        }



        proxy.getEditsForRefactor = (fileName, formatOptions, positionOrRange, refactorName, actionName, preferences) => {

            info.project.projectService.logger.info(
                `Changing... ${refactorName}, ${actionName}`
            );

            if (refactorName !== "Generate Update") {
                return info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName, preferences);
            }

            const position = typeof positionOrRange === "number" ? positionOrRange : positionOrRange.pos;
            const classOfCaller = DatatypeExtractor.getParentClassFromPosition(position, info.languageService.getProgram()?.getSourceFile(fileName));
            if (!classOfCaller) {
                return info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName, preferences);
            }
            const className = classOfCaller?.name.escapedText;


            const testEdit: ts.FileTextChanges = {
                fileName: fileName,
                textChanges: [{
                    newText: `\n\nexport type Create${className} = Partial<${className}>`,
                    span: {
                        start: classOfCaller.end,
                        length: 0,
                    }
                }]
            }

            const reaction: ts.RefactorEditInfo = {
                edits: [testEdit],
            }

            return reaction;
        }

        return proxy;
    }

    return { create };
}

export = init;