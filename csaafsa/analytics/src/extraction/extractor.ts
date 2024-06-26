import ts from "typescript";

export const HTTP_METHODS = ["Get", "Head", "Post", "Put", "Patch", "Delete", "Connect", "Options", "Trace"]

export class Extractor {

    protected static fileNamesToSourceFiles(program: ts.Program, projectFiles: string[]): ts.SourceFile[] {
        // get relevant source files from project files and extract datatypes for each file
        return projectFiles.map((file) => program.getSourceFile(file));
    }

    private static fileMembersFromSourceFile(sourceFile: ts.SourceFile): ts.Node[] | undefined {
        if (sourceFile.getChildCount() == 0) { return undefined; }
        // get syntax list of the source file
        const syntaxList = sourceFile.getChildAt(0);
        if (syntaxList.kind !== ts.SyntaxKind.SyntaxList) { return undefined; }
        return syntaxList.getChildren();
    }

    protected static classDeclarationsFromSourceFile(sourceFile: ts.SourceFile): (ts.ClassDeclaration | ts.InterfaceDeclaration | ts.TypeAliasDeclaration)[] | undefined {
        const members = this.fileMembersFromSourceFile(sourceFile);
        // access the declarations and filter for class declarations and interface declarations
        return members.filter((child) => child.kind === ts.SyntaxKind.ClassDeclaration || child.kind === ts.SyntaxKind.InterfaceDeclaration)
            .filter((dek) => dek !== undefined) as (ts.ClassDeclaration | ts.InterfaceDeclaration)[];
    }

    protected static typeAliasDeclarationsFromSourceFile(sourceFile: ts.SourceFile): ts.TypeAliasDeclaration[] | undefined {
        const members = this.fileMembersFromSourceFile(sourceFile);
        // access the declarations and filter for type alias declarations
        return members.filter((child) => child.kind === ts.SyntaxKind.TypeAliasDeclaration)
            .filter((dek) => dek !== undefined) as ts.TypeAliasDeclaration[];
    }

    protected static extractDecorators(declaration: ts.ClassDeclaration | ts.PropertyDeclaration | ts.InterfaceDeclaration | ts.PropertySignature | ts.TypeAliasDeclaration): ts.Decorator[] {
        // take class or property declaration and access decorators
        if (!declaration.modifiers) { return []; }
        return declaration.modifiers.filter((modifier) => modifier.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
    }

}