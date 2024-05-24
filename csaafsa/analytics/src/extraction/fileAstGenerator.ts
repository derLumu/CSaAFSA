import * as fs from 'fs';
import {AST, parse} from '@typescript-eslint/typescript-estree';
import {ContentChecker} from "./contentChecker";

export class FileAstGenerator {

    public static generateAsts(filePaths: string[]): { ast: AST<any>, path: string }[] {
        return filePaths.map((filePath) => this.generateAst(filePath)).filter((ast) => ast !== undefined) as { ast: AST<any>, path: string }[];
    }

    private static generateAst(filePath: string): { ast: AST<any>, path: string } | undefined {
        const sourceCode = fs.readFileSync(filePath, 'utf-8');
        const ast = parse(sourceCode)
        if (ast && ContentChecker.isRelevantFromContent(ast)) {
            return { ast: ast, path: filePath };
        } else {
            return undefined;
        }
    }

}