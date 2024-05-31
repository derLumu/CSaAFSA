import {Endpoint} from "../extraction/model/endpoint";
import {ExceptionAnalysis} from "./mainEndpointAnalyser";
import ts from "typescript";

export class ExceptionEndpointAnalyser {

    checker: ts.TypeChecker;

    seenMethods: Set<number> = new Set()
    seenExceptions: Set<string> = new Set()

    constructor(checker: ts.TypeChecker) {
        this.checker = checker
    }

    analyseEndpoint(endpoint: Endpoint): ExceptionAnalysis {
        this.recursiveMethodSearch(endpoint.methodObject)
        return {
            exceptionsThrown: this.seenExceptions.size,
            exceptionsUnhandled: Array.from(this.seenExceptions).map((exception) => endpoint.handledExceptions.includes(exception) ? 0 : 1).reduce((a, b) => a + b, 0)
        }
    }

    recursiveMethodSearch(method: ts.MethodDeclaration): void {
        // check if the method was already seen
        if (this.seenMethods.has((this.checker.getTypeAtLocation(method) as unknown as { id: number }).id)) { return }
        this.seenMethods.add((this.checker.getTypeAtLocation(method) as unknown as { id: number }).id)

        const statements = method.body?.statements as ts.NodeArray<ts.Statement>

        //TODO: implement recursive search for exceptions. Use test class to discover the structure of the AST
    }

}