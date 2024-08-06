import {Endpoint, FoundException} from "../extraction/model/endpoint";
import {DatatypeExtractor} from "../extraction/datatypeExtractor";
import {EndpointExtractor} from "../extraction/endpointExtractor";
import ts from "typescript";
import {HandledExceptionEndpointAnalyser} from "../analyseEndpoint/handledExectionEndpointAnalyser";
import {ExceptionEndpointAnalyser} from "../analyseEndpoint/exceptionEndpointAnalyser";
import {analyseDynamic} from "../analyseStatic";

export class ExceptionWithPosition {
    exception: FoundException[];
    method: ts.MethodDeclaration;
}

export class EndpointWithPosition {
    endpoint: Endpoint;
    method: ts.MethodDeclaration;
}

export class ExceptionRefactorCollector {

    public static collectUnhandled(sourcefile: ts.SourceFile, positionOrRange: ts.TextRange | number, inputConfig: string): ExceptionWithPosition {
        const newSourceFile = ts.createSourceFile(sourcefile.fileName, sourcefile.getText(), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

        const position = typeof positionOrRange === "number" ? positionOrRange : positionOrRange.pos;
        const parentClass = DatatypeExtractor.getParentClassFromPosition(position, newSourceFile)
        if (!parentClass || parentClass.kind != ts.SyntaxKind.ClassDeclaration) { return {exception: [], method: undefined} }

        const endpoint = EndpointExtractor.getParentEndpoint(parentClass, position, newSourceFile)
        if (!endpoint.endpoint) { return {exception: [], method: undefined} }

        const dia = analyseDynamic(inputConfig, [newSourceFile.fileName])
        const filtered: FoundException[] = []
        dia.filter((d) => d.code === 703).forEach((d) => {
            filtered.push({name: d.messageText.toString().split('"')[1].split('"').shift(), throwNode: undefined})
        })
        return { exception: filtered, method: endpoint.method }

        /*
-
        const program = ts.createProgram([newSourceFile.fileName], {}, compilerHost);
        const checker = program.getTypeChecker();
        const analysedEndpoint = new HandledExceptionEndpointAnalyser(checker).analyseEndpoint(endpoint.endpoint)
        return { exception: new ExceptionEndpointAnalyser(checker).analyseEndpoint(analysedEndpoint, inputConfig).exceptionsUnhandled, method: endpoint.method} */




    }

}