import {Datatype, DatatypeProperty} from "./model/datatype";
import ts from "typescript";
import {Extractor} from "./extractor";

export class DatatypeExtractor extends Extractor {

    public static extractDatatypes(program: ts.Program, checker: ts.TypeChecker, projectFiles: string[]): Datatype[] {
        const sourceFiles = this.fileNamesToSourceFiles(program, projectFiles);
        const classDeclarations = sourceFiles.flatMap((sourceFile) => this.classDeclarationsFromSourceFile(sourceFile))
            .filter((type) => type !== undefined) as (ts.ClassDeclaration | ts.InterfaceDeclaration)[];
        // extract datatype from classes
        return classDeclarations.map((declaration) => this.extractDatatypeFromClass(declaration as ts.ClassDeclaration, checker)).filter((type) => type !== undefined) as Datatype[];
    }

    private static extractDatatypeFromClass(classDeclaration: ts.ClassDeclaration | ts.InterfaceDeclaration, checker: ts.TypeChecker): Datatype | undefined {
        // ignore classes with other declarations than properties. They do not represent datatypes, thus are not relevant here
        if ((classDeclaration.members as ts.NodeArray<any>)
            .find((member) => member.kind !== ts.SyntaxKind.PropertyDeclaration && member.kind !== ts.SyntaxKind.PropertySignature)) { return undefined; }

        // collect properties and decorators, then build datatype
        const properties = this.extractDatatypeProperty(classDeclaration, checker);
        const decorators = this.extractDecorators(classDeclaration);
        // if no properties are found, the class is not a (relevant) datatype
        return properties.length === 0 ? undefined :{
            name: classDeclaration.name.escapedText,
            nameObject: classDeclaration.name,
            decorators: decorators,
            properties: properties,
            path: classDeclaration.getSourceFile().fileName
        } as Datatype;
    }

    private static extractDatatypeProperty(classDeclaration: ts.ClassDeclaration | ts.InterfaceDeclaration, checker: ts.TypeChecker): DatatypeProperty[] | undefined {
        // filter for property declarations and build properties
        const attributes: (ts.PropertyDeclaration | ts.PropertySignature)[] = (classDeclaration.members as ts.NodeArray<any>)
            .filter((member) => member.kind === ts.SyntaxKind.PropertyDeclaration || member.kind === ts.SyntaxKind.PropertySignature) as (ts.PropertyDeclaration | ts.PropertySignature)[];
        return attributes.map((attribute) => this.buildDatatypeProperty(attribute, checker));
    }

    private static buildDatatypeProperty(attribute: ts.PropertyDeclaration | ts.PropertySignature, checker: ts.TypeChecker): DatatypeProperty {
        return {
            name: (attribute.name as ts.Identifier).escapedText,
            nameObject: attribute.name as ts.Identifier,
            typeId: (checker.getTypeAtLocation(attribute.type) as unknown as {id: number}).id as number,
            decorators: this.extractDecorators(attribute)
        } as DatatypeProperty;
    }

    private static extractDecorators(declaration: ts.ClassDeclaration | ts.PropertyDeclaration | ts.InterfaceDeclaration | ts.PropertySignature): ts.Decorator[] {
        // take class or property declaration and access decorators
        if (!declaration.modifiers) { return []; }
        return declaration.modifiers.filter((modifier) => modifier.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
    }

    public static getParentClassFromPosition(position: number, file: ts.SourceFile): ts.ClassDeclaration | ts.InterfaceDeclaration | undefined {
        let foundClass: ts.ClassDeclaration | ts.InterfaceDeclaration = undefined
        file.forEachChild((node) => {
            if (node.kind === ts.SyntaxKind.ClassDeclaration || node.kind === ts.SyntaxKind.InterfaceDeclaration) {
                const classDeclaration = node as ts.ClassDeclaration | ts.InterfaceDeclaration;
                if (classDeclaration.pos <= position && classDeclaration.end >= position) {
                    foundClass = classDeclaration;
                }
            }
        })
        return foundClass;
    }
}