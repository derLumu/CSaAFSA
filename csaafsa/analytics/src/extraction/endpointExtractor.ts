import ts from "typescript";
import {Datatype} from "./model/datatype";
import {Endpoint} from "./model/endpoint";
import {Extractor} from "./extractor";

export class EndpointExtractor extends Extractor {

    static extractEndpoints(program: ts.Program, checker: ts.TypeChecker, projectFiles: string[]) {
        const sourceFiles = this.fileNamesToSourceFiles(program, projectFiles);
        const classDeclarations = sourceFiles.flatMap((sourceFile) => this.classDeclarationsFromSourceFile(sourceFile)).filter((type) => type !== undefined) as ts.ClassDeclaration[];
        return classDeclarations.flatMap((declaration) => this.extractEndpointFromClass(declaration, checker)).filter((type) => type !== undefined) as Endpoint[];
    }

    private static extractEndpointFromClass(classDeclaration: ts.ClassDeclaration, checker: ts.TypeChecker): Endpoint[] | undefined {
       return []
    }

    private static extractEndpointFromMethod(classDeclaration: ts.ClassDeclaration, checker: ts.TypeChecker): Endpoint | undefined {
        return undefined
    }

}