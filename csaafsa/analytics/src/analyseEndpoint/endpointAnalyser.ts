import ts from "typescript";
import {MethodOrConstructor} from "./exceptionEndpointAnalyser";

export abstract class EndpointAnalyser {

    checker: ts.TypeChecker;

    seenMethods: Set<number> = new Set()
    seenExceptionsString: Set<string> = new Set()

    recursiveMethodOrConstructor(method: MethodOrConstructor): void {
        // check if the method was already seen or outside the selected files
        if (this.seenMethods.has((this.checker.getTypeAtLocation(method) as unknown as { id: number }).id)) { return }
        this.seenMethods.add((this.checker.getTypeAtLocation(method) as unknown as { id: number }).id)

        // traverse the method
        const statements = method.body?.statements as ts.NodeArray<ts.Statement>
        statements?.forEach((statement) => this.recursiveNode(statement))
    }

    abstract recursiveNode(node: ts.Node): void
}