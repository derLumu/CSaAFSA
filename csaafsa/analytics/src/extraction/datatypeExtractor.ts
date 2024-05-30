import {Datatype, DatatypeProperty} from "./model/datatype";
import ts from "typescript";

export class DatatypeExtractor {

    public static extractDatatypes(program: ts.Program, checker: ts.TypeChecker, projectFiles: string[]): Datatype[] {
        // get relevant source files from project files and extract datatypes for each file
        const sourceFiles = projectFiles.map((file) => program.getSourceFile(file));
        return sourceFiles.flatMap((sourceFile) => this.extractDatatypeFromSourceFile(sourceFile, checker)).filter((type) => type !== undefined) as Datatype[];
    }

    private static extractDatatypeFromSourceFile(sourceFile: ts.SourceFile, checker: ts.TypeChecker): Datatype[] | undefined {
        if (sourceFile.getChildCount() == 0) { return undefined; }
        // get syntax list of the source file
        const syntaxList = sourceFile.getChildAt(0);
        if (syntaxList.kind !== ts.SyntaxKind.SyntaxList) { return undefined; }
        // access the declarations and filter for class declarations
        const classDeclarations: ts.ClassDeclaration[] = syntaxList.getChildren().filter((child) => child.kind === ts.SyntaxKind.ClassDeclaration) as ts.ClassDeclaration[];
        // extract datatype from classes
        return classDeclarations.map((declaration) => this.extractDatatypeFromClass(declaration as ts.ClassDeclaration, checker, sourceFile.fileName)).filter((type) => type !== undefined) as Datatype[];
    }

    private static extractDatatypeFromClass(classDeclaration: ts.ClassDeclaration, checker: ts.TypeChecker, fileName: string): Datatype | undefined {
        // ignore classes with other declarations than properties. They do not represent datatypes, thus are not relevant here
        if (classDeclaration.members.find((member) => member.kind !== ts.SyntaxKind.PropertyDeclaration)) { return undefined; }

        // collect properties and decorators, then build datatype
        const properties = this.extractDatatypeProperty(classDeclaration, checker);
        const decorators = this.extractDecorators(classDeclaration);
        // if no properties are found, the class is not a (relevant) datatype
        return properties.length === 0 ? undefined :{
            name: classDeclaration.name.escapedText,
            decorators: decorators,
            properties: properties,
            path: fileName
        } as Datatype;
    }

    private static extractDatatypeProperty(classDeclaration: ts.ClassDeclaration, checker: ts.TypeChecker): DatatypeProperty[] | undefined {
        // filter for property declarations and build properties
        const attributes: ts.PropertyDeclaration[] = classDeclaration.members.filter((member) => member.kind === ts.SyntaxKind.PropertyDeclaration) as ts.PropertyDeclaration[];
        return attributes.map((attribute) => this.buildDatatypeProperty(attribute, checker));
    }

    private static buildDatatypeProperty(attribute: ts.PropertyDeclaration, checker: ts.TypeChecker): DatatypeProperty {
        return {
            name: (attribute.name as ts.Identifier).escapedText,
            typeId: (checker.getTypeAtLocation(attribute.type) as unknown as {id: number}).id as number,
            decorators: this.extractDecorators(attribute)
        } as DatatypeProperty;
    }

    private static extractDecorators(declaration: ts.ClassDeclaration | ts.PropertyDeclaration): ts.Decorator[] {
        // take class or property declaration and access decorators
        if (!declaration.modifiers) { return []; }
        return declaration.modifiers.filter((modifier) => modifier.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
    }
}