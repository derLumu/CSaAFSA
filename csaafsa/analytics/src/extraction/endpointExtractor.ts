import ts from "typescript";
import {Endpoint} from "./model/endpoint";
import {Extractor} from "./extractor";

export class EndpointExtractor extends Extractor {

    static extractEndpoints(program: ts.Program, checker: ts.TypeChecker, projectFiles: string[]) {
        const sourceFiles = this.fileNamesToSourceFiles(program, projectFiles);
        const classDeclarations = sourceFiles.flatMap((sourceFile) => this.classDeclarationsFromSourceFile(sourceFile)).filter((type) => type !== undefined) as ts.ClassDeclaration[];
        return classDeclarations.flatMap((declaration) => this.extractEndpointFromClass(declaration, checker)).filter((type) => type !== undefined);
    }

    private static extractEndpointFromClass(classDeclaration: ts.ClassDeclaration, checker: ts.TypeChecker): Endpoint[] | undefined {
        // look if there is a decorator with the name "Controller", otherwise the class is not a controller and undefined is returned
        const classDecorators = classDeclaration.modifiers.filter((mod) => mod.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
        const callExpressions = classDecorators.filter((dec) => dec.expression.kind === ts.SyntaxKind.CallExpression).map((dec) => dec.expression) as ts.CallExpression[];
        const identifier = callExpressions.filter((exp) => exp.expression.kind === ts.SyntaxKind.Identifier).map((exp) => exp.expression) as ts.Identifier[];
        if (!identifier.map((id) => id.escapedText).find((s) => s === "Controller")) { return undefined; }

        // extract methods from the controller
        const methods: ts.MethodDeclaration[] = classDeclaration.members.filter((member) => member.kind === ts.SyntaxKind.MethodDeclaration) as ts.MethodDeclaration[];
        return methods.map((method) => this.extractEndpointFromMethod(method, checker)).filter((type) => type !== undefined);
    }

    private static extractEndpointFromMethod(methodDeclaration: ts.MethodDeclaration, checker: ts.TypeChecker): Endpoint | undefined {
        return undefined
    }

}