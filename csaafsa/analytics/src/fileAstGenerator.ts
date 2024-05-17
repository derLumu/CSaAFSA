import * as fs from 'fs';
import {AST, parse} from '@typescript-eslint/typescript-estree';
import {ContentChecker} from "./contentChecker";

export class FileAstGenerator {

    public static generateAsts(filePaths: string[]): AST<any>[] {
        return filePaths.map((filePath) => this.generateAst(filePath)).filter((ast) => ast !== undefined) as AST<any>[];
    }

    private static generateAst(filePath: string): AST<any> | undefined {
        const sourceCode = fs.readFileSync(filePath, 'utf-8');
        const ast = parse(sourceCode)
        return (ast && ContentChecker.isRelevantFromContent(ast))? ast : undefined;
    }

}