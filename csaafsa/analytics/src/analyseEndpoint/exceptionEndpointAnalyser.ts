import {Endpoint, FoundException} from "../extraction/model/endpoint";
import {ExceptionAnalysis} from "./mainEndpointAnalyser";
import ts from "typescript";
import fs from "fs";
import {EndpointAnalyser} from "./endpointAnalyser";

export type MethodOrConstructor = ts.MethodDeclaration | ts.ConstructorDeclaration
export const CONFIG_FILE_NAME = "analytics.config.json"

export class ExceptionEndpointAnalyser extends EndpointAnalyser{

    mappedExceptions: { "stringMatch": string, "ExceptionToHandle": string }[]  = []
    seenExceptions: Set<FoundException> = new Set()
    diagnostics: ts.Diagnostic[] = []

    constructor(checker: ts.TypeChecker, projectFiles: string[]) {
        super()
        this.checker = checker;
        this.projectFiles = projectFiles;
    }

    analyseEndpoint(endpoint: Endpoint): ExceptionAnalysis {
        this.loadMappedExceptions()
        this.recursiveMethodOrConstructor(endpoint.methodObject)
        let unhandledCounter = 0;
        this.seenExceptions.forEach((exception) => {
            if (!endpoint.handledExceptions.find(e => exception.name.includes(e))) {
                unhandledCounter++;
                //TODO: remind the throw object or file path of it to display it here
                this.diagnostics.push({
                    file: exception.throwNode.getSourceFile(),
                    start: exception.throwNode.getStart(),
                    length: (exception.throwNode.getEnd() - exception.throwNode.getStart())? (exception.throwNode.getEnd() - exception.throwNode.getStart()) : 10,
                    messageText: `Exception "${exception.name}" is not documented in endpoint "${endpoint.name}"!`,
                    category: ts.DiagnosticCategory.Warning,
                    code: 779,
                    source: 'EndpointAnalyser'
                })
                this.diagnostics.push({
                    file: endpoint.methodObject.getSourceFile(),
                    start: endpoint.methodObject.name.getStart(),
                    length: (endpoint.methodObject.name.getEnd() - endpoint.methodObject.name.getStart())? (endpoint.methodObject.name.getEnd() - endpoint.methodObject.name.getStart()) : 10,
                    messageText: `Exception "${exception.name}" is not documented in this endpoint!`,
                    category: ts.DiagnosticCategory.Warning,
                    code: 779,
                    source: 'EndpointAnalyser',
                })
            }
        })
        return {
            exceptionsThrown: Array.from(this.seenExceptions),
            exceptionsUnhandled: unhandledCounter,
            diagnostics: this.diagnostics
        }
    }

    recursiveNode(node: ts.Node): void {
        // check if the node is a throw statement -> get the exception
        if (node.kind === ts.SyntaxKind.ThrowStatement) {
            const exception = (node as ts.ThrowStatement).expression as ts.NewExpression
            if (exception.kind === ts.SyntaxKind.NewExpression) {
                !this.seenExceptionsString.has(exception.expression.getText()) && this.seenExceptions.add({
                    name: exception.expression.getText(),
                    throwNode: node as ts.ThrowStatement
                }) && this.seenExceptionsString.add(exception.expression.getText())
            }
            else if (exception.kind === ts.SyntaxKind.Identifier) {
                const symbol = this.checker.getSymbolAtLocation(exception)
                !this.seenExceptionsString.has(symbol.getName()) && this.seenExceptions.add({
                    name: symbol.getName(),
                    throwNode: node as ts.ThrowStatement
                }) && this.seenExceptionsString.add(symbol.getName())
            }
            return;
        }

        if (node.kind == ts.SyntaxKind.Identifier) {
            const match = this.mappedExceptions.find((exception) => node.getText().toLowerCase().includes(exception.stringMatch.toLowerCase()))
            if (match) {
                !this.seenExceptionsString.has(node.getText()) && this.seenExceptions.add({
                    name: match.ExceptionToHandle,
                    throwNode: node
                }) && this.seenExceptionsString.add(node.getText())
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

    private loadMappedExceptions() {
        if (!fs.existsSync("./analytics/src/" + CONFIG_FILE_NAME)) { return }
        const configFile = fs.readFileSync("./analytics/src/" + CONFIG_FILE_NAME, 'utf-8');
        const config = JSON.parse(configFile)
        if (!config.mappedExceptions) { return }
        config.mappedExceptions.forEach((exception: { "stringMatch": string, "ExceptionToHandle": string }) => {
            this.mappedExceptions.push(exception);
        })
    }
}