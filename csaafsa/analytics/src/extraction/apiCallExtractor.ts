import {Extractor} from "./extractor";
import ts from "typescript/lib/tsserverlibrary";

export class ApiCallExtractor  extends Extractor{

    private hasHTTPMethode = /(Get|Head|Post|Put|Patch|Delete|Connect|Options|Trace)/gi;
    private isApiCall = /(http|localhost)/gi;

    private apiCalls: string[] = []

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
                this.buildApiCall(methode, syntaxList)
            }
        }

        // continue traversing
        node.forEachChild((child) => this.recursiveNode(child, checker))
    }

    private buildApiCall(methode: string, syntaxList: ts.SyntaxList) {
        console.log(syntaxList.getChildren()[0]?.getChildren().map((child) => child.getText()))
        const children = syntaxList.getChildren()
        if (!children || children.length == 0) { return }
        //TODO: replace all PropertyAccesses with their real StringLiteral
    }
}