import {Endpoint} from "../extraction/model/endpoint";
import ts, {CallExpression, MethodDeclaration} from "typescript";
import {HTTP_METHODS} from "../extraction/extractor";
import {EndpointAnalyser} from "./endpointAnalyser";

type MethodOrConstructor = ts.MethodDeclaration | ts.ConstructorDeclaration

export class HandledExceptionEndpointAnalyser extends EndpointAnalyser {

    constructor(checker: ts.TypeChecker) {
        super()
        this.checker = checker;
    }

    analyseEndpoint(endpoint: Endpoint): Endpoint {
        const decorators = endpoint.methodObject.modifiers.filter((mod) => mod.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
        const decoratorCalls = decorators.map(d => this.checker.getSymbolAtLocation(((d.expression as CallExpression).expression))?.declarations[0] as MethodDeclaration).filter((dec) => dec !== undefined) as MethodDeclaration[];
        decoratorCalls.forEach((dec) => this.recursiveMethodOrConstructor(dec))
        if (decoratorCalls.find((dec) => dec.getText().includes("AssignmentAuth"))) {
            endpoint.handledExceptions.unshift("Forbidden")
        }
        endpoint.handledExceptions = endpoint.handledExceptions.concat(Array.from(this.seenExceptionsString))
        return endpoint
    }

    recursiveNode(node: ts.Node): void {
        if (node.kind == ts.SyntaxKind.CallExpression) {
            if (!HTTP_METHODS.includes(node.getText()) && node.getText().startsWith("TypedException<")) {
                this.seenExceptionsString.add(node.getText().split('<')?.pop()?.split('>')?.shift())
            }
            else if (!HTTP_METHODS.includes(node.getText()) && node.getText().endsWith("Response") && node.getText().startsWith("Api")) {
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