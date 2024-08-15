import ts from "typescript";
import {Endpoint} from "./model/endpoint";
import {Extractor, HTTP_METHODS} from "./extractor";
import {EndpointWithPosition} from "../serverPlugin/exceptionRefactorCollector";

export const EXCEPTIONS = [
    "BadRequestException",
    "Unauthorized",
    "NotFound",
    "Forbidden",
    "NotAcceptable",
    "RequestTimeout",
    "Conflict",
    "Gone",
    "HttpVersionNotSupported",
    "PayloadTooLarge",
    "UnsupportedMediaType",
    "UnprocessableEntity",
    "InternalServerError",
    "NotImplemented",
    "ImATeapot",
    "MethodNotAllowed",
    "BadGateway",
    "ServiceUnavailable",
    "GatewayTimeout",
    "PreconditionFailed"]

export class EndpointExtractor extends Extractor {

    static extractEndpoints(program: ts.Program, projectFiles: string[]) {
        const sourceFiles = this.fileNamesToSourceFiles(program, projectFiles);
        const classDeclarations = sourceFiles.flatMap((sourceFile) => this.classDeclarationsFromSourceFile(sourceFile)).filter((type) => type !== undefined) as ts.ClassDeclaration[];
        const endpoints = classDeclarations.flatMap((declaration) => this.extractEndpointFromClass(declaration, declaration.getSourceFile()))
            .filter((type) => type !== undefined)
        endpoints.forEach((endpoint) => endpoint.handledExceptions = endpoint.handledExceptions.filter(e => EXCEPTIONS.includes(e)));
        return endpoints as Endpoint[];
    }

    private static extractEndpointFromClass(classDeclaration: ts.ClassDeclaration, sourceFile: ts.SourceFile): Endpoint[] | undefined {
        // look if there is a decorator with the name "Controller", otherwise the class is not a controller and undefined is returned
        const identifier = this.extractIdentifier(classDeclaration)
        if (!identifier.map((id) => id.getText()).find((s) => s === "Controller")) { return undefined; }

        // extract the path prefix from the controller
        const apiTags = identifier.find((s) => s.getText() === "Controller")
        if (!apiTags) { return undefined; }
        const urlPrefix = (apiTags.parent as ts.CallExpression).arguments[0]?.getText()

        // extract methods from the controller
        const methods: ts.MethodDeclaration[] = classDeclaration.members.filter((member) => member.kind === ts.SyntaxKind.MethodDeclaration) as ts.MethodDeclaration[];
        return methods.map((method) => this.extractEndpointFromMethod(method, urlPrefix, sourceFile)).filter((type) => type !== undefined);
    }

    private static extractEndpointFromMethod(methodDeclaration: ts.MethodDeclaration, urlPrefix: string, sourceFile: ts.SourceFile): Endpoint | undefined {
        // get the type of the method
        const identifier = this.extractIdentifier(methodDeclaration)
        const type = identifier.map((id) => id.getText(sourceFile).split('.').pop()).find((s) => HTTP_METHODS.includes(s.toString()))
        if (!type) { return undefined; }
        // safe all other decorators
        const decorators = methodDeclaration.modifiers.filter((mod) => mod.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
        const handledExceptionsNestia = decorators.map(d => d.getText(sourceFile)).filter((s) => !HTTP_METHODS.includes(s) && s.startsWith("@TypedException<")).map((s) => s.split('<')?.pop()?.split('>')?.shift())
        const handledExceptionsDefault = identifier.map((id) => id.getText()).filter((s) => !HTTP_METHODS.includes(s) && s.endsWith("Response") && s.startsWith("Api")).map((s) => s.substring(3, s.length - 8))
        const handledExceptions = new Set([...handledExceptionsNestia, ...handledExceptionsDefault])
        let path = methodDeclaration.modifiers.find(m => HTTP_METHODS.includes(m.getText(sourceFile).split('.').pop().split('(').shift()))?.getText(sourceFile).split('(').pop().split(')').shift().slice(1, -1)
        !path && (path = methodDeclaration.modifiers.find(m => HTTP_METHODS.includes(m.getText(sourceFile).slice(1).split('(').shift()))?.getText(sourceFile).split('(').pop().split(')').shift().slice(1, -1))

        return {
            name: methodDeclaration.name.getText(sourceFile),
            type: type as "Get" | "Post" | "Patch" | "Delete",
            url: urlPrefix?.replace(/'/g, "") + "/" + (path? path: ""),
            handledExceptions: Array.from(handledExceptions),
            methodObject: methodDeclaration,
            filePath: sourceFile.fileName
        }
    }

    private static extractIdentifier(declarations: ts.ClassDeclaration | ts.MethodDeclaration): (ts.Identifier | ts.PropertyAccessExpression)[] {
       const classDecorators = declarations.modifiers?.filter((mod) => mod.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
       const callExpressions = classDecorators?.filter((dec) => dec.expression.kind === ts.SyntaxKind.CallExpression).map((dec) => dec.expression) as ts.CallExpression[];
       return callExpressions? callExpressions.filter((exp) => exp.expression.kind === ts.SyntaxKind.Identifier || exp.expression.kind === ts.SyntaxKind.PropertyAccessExpression).map((exp) => exp.expression) as (ts.Identifier | ts.PropertyAccessExpression)[]: [];
    }

    public static getParentEndpoint(parentClass: ts.ClassDeclaration, position: number, sourceFile: ts.SourceFile): EndpointWithPosition | undefined {
        let foundMethod: ts.MethodDeclaration = undefined
        parentClass.forEachChild((node) => {
            if (node.kind === ts.SyntaxKind.MethodDeclaration) {
                const methodDeclaration = node as ts.MethodDeclaration;
                if (methodDeclaration.pos <= position && methodDeclaration.end >= position) {
                    foundMethod = methodDeclaration;
                }
            }
        })
        return { endpoint: this.extractEndpointFromMethod(foundMethod, "", sourceFile), method: foundMethod };
    }

}