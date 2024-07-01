import ts from "typescript";
import {Endpoint} from "./model/endpoint";
import {Extractor, HTTP_METHODS} from "./extractor";

export class EndpointExtractor extends Extractor {

    static extractEndpoints(program: ts.Program, projectFiles: string[]) {
        const sourceFiles = this.fileNamesToSourceFiles(program, projectFiles);
        const classDeclarations = sourceFiles.flatMap((sourceFile) => this.classDeclarationsFromSourceFile(sourceFile)).filter((type) => type !== undefined) as ts.ClassDeclaration[];
        return classDeclarations.flatMap((declaration) => this.extractEndpointFromClass(declaration)).filter((type) => type !== undefined);
    }

    private static extractEndpointFromClass(classDeclaration: ts.ClassDeclaration): Endpoint[] | undefined {
        // look if there is a decorator with the name "Controller", otherwise the class is not a controller and undefined is returned
        const identifier = this.extractIdentifier(classDeclaration)
        if (!identifier.map((id) => id.getText()).find((s) => s === "Controller")) { return undefined; }

        // extract the path prefix from the controller
        const apiTags = identifier.find((s) => s.getText() === "Controller")
        if (!apiTags) { return undefined; }
        const urlPrefix = (apiTags.parent as ts.CallExpression).arguments[0]?.getText()

        // extract methods from the controller
        const methods: ts.MethodDeclaration[] = classDeclaration.members.filter((member) => member.kind === ts.SyntaxKind.MethodDeclaration) as ts.MethodDeclaration[];
        return methods.map((method) => this.extractEndpointFromMethod(method, urlPrefix)).filter((type) => type !== undefined);
    }

    private static extractEndpointFromMethod(methodDeclaration: ts.MethodDeclaration, urlPrefix: string): Endpoint | undefined {
        // get the type of the method
        const identifier = this.extractIdentifier(methodDeclaration)
        const type = identifier.map((id) => id.getText().split('.').pop()).find((s) => HTTP_METHODS.includes(s.toString()))
        if (!type) { return undefined; }
        // safe all other decorators
        const decorators = methodDeclaration.modifiers.filter((mod) => mod.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
        const handledExceptions = decorators.map(d => d.getText()).filter((s) => !HTTP_METHODS.includes(s) && s.startsWith("@TypedException<")).map((s) => s.split('<')?.pop()?.split('>')?.shift())
        const path = (identifier.find((s) => HTTP_METHODS.includes(s.getText().split('.').pop())).parent as ts.CallExpression).arguments[0]?.getText()

        return {
            name: methodDeclaration.name.getText(),
            type: type as "Get" | "Post" | "Patch" | "Delete",
            url: urlPrefix.replace(/'/g, "") + "/" + (path? path: ""),
            handledExceptions: handledExceptions,
            methodObject: methodDeclaration,
            filePath: methodDeclaration.getSourceFile().fileName
        }
    }

    private static extractIdentifier(declarations: ts.ClassDeclaration | ts.MethodDeclaration): (ts.Identifier | ts.PropertyAccessExpression)[] {
       const classDecorators = declarations.modifiers.filter((mod) => mod.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
       const callExpressions = classDecorators.filter((dec) => dec.expression.kind === ts.SyntaxKind.CallExpression).map((dec) => dec.expression) as ts.CallExpression[];
       return callExpressions.filter((exp) => exp.expression.kind === ts.SyntaxKind.Identifier || exp.expression.kind === ts.SyntaxKind.PropertyAccessExpression).map((exp) => exp.expression) as (ts.Identifier | ts.PropertyAccessExpression)[];
    }



}