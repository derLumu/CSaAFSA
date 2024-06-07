import {Endpoint} from "../extraction/model/endpoint";
import ts, {CallExpression, MethodDeclaration} from "typescript";
import {HTTP_METHODS} from "../extraction/endpointExtractor";

type MethodOrConstructor = ts.MethodDeclaration | ts.ConstructorDeclaration

export class HandledExceptionEndpointAnalyser {

    checker: ts.TypeChecker;
    projectFiles: string[]

    seenMethods: Set<number> = new Set()
    seenExceptionsString: Set<string> = new Set()

    constructor(checker: ts.TypeChecker, projectFiles: string[]) {
        this.checker = checker;
        this.projectFiles = projectFiles;
    }

    analyseEndpoint(endpoint: Endpoint): Endpoint {
        const decorators = endpoint.methodObject.modifiers.filter((mod) => mod.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
        const decoratorCalls = decorators.map(d => this.checker.getSymbolAtLocation(((d.expression as CallExpression).expression)).declarations[0] as MethodDeclaration).filter((dec) => dec !== undefined) as MethodDeclaration[];
        decoratorCalls.forEach((dec) => this.recursiveMethodOrConstructor(dec))
        endpoint.handledExceptions = endpoint.handledExceptions.concat(Array.from(this.seenExceptionsString))
        return endpoint
    }

    recursiveMethodOrConstructor(method: MethodOrConstructor): void {
        // check if the method was already seen or outside the selected files
        if (!this.projectFiles.includes(method.getSourceFile().fileName)) {  return }
        if (this.seenMethods.has((this.checker.getTypeAtLocation(method) as unknown as { id: number }).id)) { return }
        this.seenMethods.add((this.checker.getTypeAtLocation(method) as unknown as { id: number }).id)

        // traverse the method
        const statements = method.body?.statements as ts.NodeArray<ts.Statement>
        statements?.forEach((statement) => this.recursiveNode(statement))
    }

    recursiveNode(node: ts.Node): void {
        if (node.kind == ts.SyntaxKind.Identifier) {
            if (!HTTP_METHODS.includes(node.getText()) && node.getText().endsWith("Response") && node.getText().startsWith("Api")) {
                this.seenExceptionsString.add(node.getText().substring(3, node.getText().length - 8))
            }
        }

        // check if the node is a call -> get the symbol -> search the extracted constructor or method
        if (node.kind === ts.SyntaxKind.NewExpression || node.kind === ts.SyntaxKind.PropertyAccessExpression) {
            if (node.kind === ts.SyntaxKind.NewExpression) {
                node = (node as ts.NewExpression).expression as ts.Identifier
            }
            const symbol = this.checker.getSymbolAtLocation(node)
            if (!symbol) { return }
            const declaration = symbol.valueDeclaration
            if (!declaration) { return }
            if (declaration.kind === ts.SyntaxKind.MethodDeclaration) {
                // found a method -> continue only with the method
                this.recursiveMethodOrConstructor(declaration as ts.MethodDeclaration)
            } else if (declaration.kind === ts.SyntaxKind.ClassDeclaration) {
                // found a class -> continue with all constructors
                const constructors = (declaration as ts.ClassDeclaration).members.filter((member) => member.kind === ts.SyntaxKind.Constructor)
                constructors.forEach((constructor) => { this.recursiveMethodOrConstructor(constructor as MethodOrConstructor) })
            }
            return;
        }

        // continue traversing
        node.forEachChild((child) => this.recursiveNode(child))
    }
}