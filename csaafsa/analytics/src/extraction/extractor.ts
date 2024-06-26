import ts from "typescript";

export const HTTP_METHODS = ["Get", "Head", "Post", "Put", "Patch", "Delete", "Connect", "Options", "Trace"]

export class Extractor {

    public static fileNamesToSourceFiles(program: ts.Program, projectFiles: string[]): ts.SourceFile[] {
        // get relevant source files from project files and extract datatypes for each file
        return projectFiles.map((file) => program.getSourceFile(file));
    }

    public static classDeclarationsFromSourceFile(sourceFile: ts.SourceFile): (ts.ClassDeclaration | ts.InterfaceDeclaration)[] | undefined {
        if (sourceFile.getChildCount() == 0) { return undefined; }
        // get syntax list of the source file
        const syntaxList = sourceFile.getChildAt(0);
        if (syntaxList.kind !== ts.SyntaxKind.SyntaxList) { return undefined; }
        // access the declarations and filter for class declarations
        return syntaxList.getChildren().filter((child) => child.kind === ts.SyntaxKind.ClassDeclaration || child.kind === ts.SyntaxKind.InterfaceDeclaration).filter((dek) => dek !== undefined) as (ts.ClassDeclaration | ts.InterfaceDeclaration)[];
    }

}