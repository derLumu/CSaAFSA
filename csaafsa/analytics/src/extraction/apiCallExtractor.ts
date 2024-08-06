import {Extractor} from "./extractor";
import ts from "typescript";
import {ApiCall} from "./model/endpoint";

export class ApiCallExtractor  extends Extractor{

    private hasHTTPMethode = /(Get|Head|Post|Put|Patch|Delete|Connect|Options|Trace)/gi;
    private isApiCall = /(http|localhost)/gi;

    private apiCalls: ApiCall[] = []

    public extractApiCalls(program: ts.Program, projectFiles: string[], checker: ts.TypeChecker) {
        const sourceFiles = Extractor.fileNamesToSourceFiles(program, projectFiles);
        const classDeclarations = sourceFiles.flatMap((sourceFile) => Extractor.classDeclarationsFromSourceFile(sourceFile)).filter((type) => type !== undefined) as ts.ClassDeclaration[];
        classDeclarations.forEach((declaration) => this.extractApiCallsFromClass(declaration, checker));
        return this.apiCalls;
    }

    private extractApiCallsFromClass(classDeclaration: ts.ClassDeclaration, checker: ts.TypeChecker): void {
        // extract methods from the controller
        const methods: ts.MethodDeclaration[] = classDeclaration.members.filter((member) => member.kind === ts.SyntaxKind.MethodDeclaration) as ts.MethodDeclaration[];
        methods.forEach((method) => this.recursiveNode(method, checker));

    }

    recursiveNode(node: ts.Node, checker: ts.TypeChecker): void {
        if (node.kind === ts.SyntaxKind.CallExpression && node.getText().match(this.hasHTTPMethode)) {
            const methode = node.getChildren().find((child) => child.kind === ts.SyntaxKind.PropertyAccessExpression)?.getText().split(".").pop()
            const syntaxList = node.getChildren().find((child) => child.kind === ts.SyntaxKind.SyntaxList) as ts.SyntaxList
            if (methode && methode.match(this.hasHTTPMethode) && syntaxList) {
                this.buildApiCall(methode, syntaxList, checker)
            }
        }

        // continue traversing
        node.forEachChild((child) => this.recursiveNode(child, checker))
    }

    private buildApiCall(methode: string, syntaxList: ts.SyntaxList, checker: ts.TypeChecker) {
        const urlNode = syntaxList.getChildren()[0]
        if (!urlNode) { return }
        const urlString = urlNode.getChildren().flatMap((child) => this.recursiveSyntaxList(child, checker)).join("")
        if (urlString.match(this.isApiCall)) {
            this.apiCalls.push({
                method: methode,
                url: urlString,
                filePath: urlNode.getSourceFile().fileName
            })
        }
    }

    private recursiveSyntaxList(node: ts.Node, checker: ts.TypeChecker): string {
        if (!node) { return "" }
        if (node.kind === ts.SyntaxKind.StringLiteral) {
            return node.getText()
        }

        if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const initializer = (checker.getSymbolAtLocation(node)?.valueDeclaration as ts.PropertyAssignment).initializer
            return this.recursiveSyntaxList(initializer, checker)
        }

        return node.getChildren().flatMap((child) => this.recursiveSyntaxList(child, checker)).join("")
    }
}