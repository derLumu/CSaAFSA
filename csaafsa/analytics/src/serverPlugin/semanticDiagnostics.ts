import {analyseDynamic} from "../analyseStatic";

export function getSemanticDiagnostics(prior: ts.Diagnostic[], rootFiles: string[], configPath: string, filename: string): ts.Diagnostic[] {
    const diagnostics = analyseDynamic(configPath, rootFiles)
        .filter(d => d.file.fileName === filename);
    return prior.concat(diagnostics);
}