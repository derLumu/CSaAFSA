import ts from "typescript";
import {Endpoint} from "./model/endpoint";
import {Extractor} from "./extractor";

export const HTTP_METHODS = ["Get", "Head", "Post", "Put", "Patch", "Delete", "Connect", "Options", "Trace"]

export class EndpointExtractor extends Extractor {

    static extractEndpoints(program: ts.Program, projectFiles: string[], checker: ts.TypeChecker) {
        const sourceFiles = this.fileNamesToSourceFiles(program, projectFiles);
        const classDeclarations = sourceFiles.flatMap((sourceFile) => this.classDeclarationsFromSourceFile(sourceFile)).filter((type) => type !== undefined) as ts.ClassDeclaration[];
        return classDeclarations.flatMap((declaration) => this.extractEndpointFromClass(declaration, checker)).filter((type) => type !== undefined);
    }

    private static extractEndpointFromClass(classDeclaration: ts.ClassDeclaration, checker: ts.TypeChecker): Endpoint[] | undefined {
        // look if there is a decorator with the name "Controller", otherwise the class is not a controller and undefined is returned
        const identifier = this.extractIdentifier(classDeclaration, checker)
        if (!identifier.map((id) => id.escapedText).find((s) => s === "Controller")) { return undefined; }

        // extract the path prefix from the controller
        const apiTags = identifier.find((s) => s.escapedText === "ApiTags")
        if (!apiTags) { return undefined; }
        const urlPrefix = (apiTags.parent as ts.CallExpression).arguments[0].getText()

        // extract methods from the controller
        const methods: ts.MethodDeclaration[] = classDeclaration.members.filter((member) => member.kind === ts.SyntaxKind.MethodDeclaration) as ts.MethodDeclaration[];
        return methods.map((method) => this.extractEndpointFromMethod(method, urlPrefix, checker)).filter((type) => type !== undefined);
    }

    private static extractEndpointFromMethod(methodDeclaration: ts.MethodDeclaration, urlPrefix: string, checker: ts.TypeChecker): Endpoint | undefined {
        // get the type of the method
        const identifier = this.extractIdentifier(methodDeclaration, checker)
        const type = identifier.map((id) => id.escapedText).find((s) => HTTP_METHODS.includes(s.toString()))
        if (!type) { return undefined; }
        // safe all other decorators
        const decoratorNames = identifier.map((id) => id.getText()).filter((s) => !HTTP_METHODS.includes(s) && s.endsWith("Response") && s.startsWith("Api")).map((s) => s.substring(3, s.length - 8))

        return {
            name: methodDeclaration.name.getText(),
            type: type as "Get" | "Post" | "Patch" | "Delete",
            url: urlPrefix.replace(/'/g, "") + "/" + methodDeclaration.name.getText(),
            handledExceptions: decoratorNames,
            methodObject: methodDeclaration,
            filePath: methodDeclaration.getSourceFile().fileName
        }
    }

    private static extractIdentifier(declarations: ts.ClassDeclaration | ts.MethodDeclaration, checker: ts.TypeChecker): ts.Identifier[] {
       const classDecorators = declarations.modifiers.filter((mod) => mod.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
       const callExpressions = classDecorators.filter((dec) => dec.expression.kind === ts.SyntaxKind.CallExpression).map((dec) => dec.expression) as ts.CallExpression[];
       return callExpressions.filter((exp) => exp.expression.kind === ts.SyntaxKind.Identifier).map((exp) => exp.expression) as ts.Identifier[];
    }



}