import {Endpoint, FoundException} from "../extraction/model/endpoint";
import {DatatypeExtractor} from "../extraction/datatypeExtractor";
import {EndpointExtractor} from "../extraction/endpointExtractor";
import ts from "typescript/lib/tsserverlibrary";
import {HandledExceptionEndpointAnalyser} from "../analyseEndpoint/handledExectionEndpointAnalyser";
import {ExceptionEndpointAnalyser} from "../analyseEndpoint/exceptionEndpointAnalyser";

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
        const position = typeof positionOrRange === "number" ? positionOrRange : positionOrRange.pos;
        const parentClass = DatatypeExtractor.getParentClassFromPosition(position, sourcefile)
        if (!parentClass || parentClass.kind != ts.SyntaxKind.ClassDeclaration) { return {exception: [], method: undefined} }

        const endpoint = EndpointExtractor.getParentEndpoint(parentClass, position)
        if (!endpoint.endpoint) { return {exception: [], method: undefined} }

        const program = ts.createProgram([sourcefile.fileName], {});
        const checker = program.getTypeChecker();
        const analysedEndpoint = new HandledExceptionEndpointAnalyser(checker).analyseEndpoint(endpoint.endpoint)
        return { exception: new ExceptionEndpointAnalyser(checker).analyseEndpoint(analysedEndpoint, inputConfig).exceptionsUnhandled, method: endpoint.method}
    }

}