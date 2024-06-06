import {Endpoint} from "../extraction/model/endpoint";
import {ExceptionAnalysis} from "./mainEndpointAnalyser";
import ts from "typescript";
import fs from "fs";
import {CONFIG_FILE_NAME} from "../main";

type MethodOrConstructor = ts.MethodDeclaration | ts.ConstructorDeclaration

export class ExceptionEndpointAnalyser {

    checker: ts.TypeChecker;
    projectFiles: string[]

    mappedExceptions: { "stringMatch": string, "ExceptionToHandle": string }[]  = []

    seenMethods: Set<number> = new Set()
    seenExceptions: Set<string> = new Set()

    constructor(checker: ts.TypeChecker, projectFiles: string[]) {
        this.checker = checker;
        this.projectFiles = projectFiles;
    }

    analyseEndpoint(endpoint: Endpoint): ExceptionAnalysis {
        this.loadMappedExceptions()
        this.recursiveMethodOrConstructor(endpoint.methodObject)
        let unhandledCounter = 0;
        this.seenExceptions.forEach((exception) => {
            if (!endpoint.handledExceptions.find(e => exception.includes(e))) {
                unhandledCounter++;
                //TODO: remind the throw object or file path of it to display it here
                console.warn(`Exception "${exception}" in endpoint "${endpoint.name}" with url "(${endpoint.type}) ${endpoint.url}" is not handled! \n - Found in File: ${endpoint.methodObject.getSourceFile().fileName}`)
            }
        })
        console.log(this.seenExceptions)
        return {
            exceptionsThrown: this.seenExceptions.size,
            exceptionsUnhandled: unhandledCounter
        }
    }

    recursiveMethodOrConstructor(method: MethodOrConstructor): void {
        // check if the method was already seen or outside the selected files
        if (!this.projectFiles.includes(method.getSourceFile().fileName)) {  return }
        if (this.seenMethods.has((this.checker.getTypeAtLocation(method) as unknown as { id: number }).id)) { return }
        this.seenMethods.add((this.checker.getTypeAtLocation(method) as unknown as { id: number }).id)

        // traverse the method
        const statements = method.body?.statements as ts.NodeArray<ts.Statement>
        statements.forEach((statement) => this.recursiveNode(statement))
    }

    recursiveNode(node: ts.Node): void {
        // check if the node is a throw statement -> get the exception
        if (node.kind === ts.SyntaxKind.ThrowStatement) {
            const exception = (node as ts.ThrowStatement).expression as ts.NewExpression
            if (exception.kind === ts.SyntaxKind.NewExpression) { this.seenExceptions.add(exception.expression.getText()) }
            else if (exception.kind === ts.SyntaxKind.Identifier) { this.seenExceptions.add(this.checker.getSymbolAtLocation(exception).getName()) }
            return;
        }

        if (node.kind == ts.SyntaxKind.Identifier) {
            const match = this.mappedExceptions.find((exception) => node.getText().toLowerCase().includes(exception.stringMatch.toLowerCase()))
            if (match) { this.seenExceptions.add(match.ExceptionToHandle) }
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