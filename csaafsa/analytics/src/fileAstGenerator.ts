import * as fs from 'fs';
import {AST, parse} from '@typescript-eslint/typescript-estree';

export class FileAstGenerator {

    public static generateAsts(filePaths: string[]): AST<any>[] {
        return filePaths.map((filePath) => this.generateAst(filePath)).filter((ast) => ast !== undefined) as AST<any>[];
    }

    private static generateAst(filePath: string): AST<any> | undefined {
        const sourceCode = fs.readFileSync(filePath, 'utf-8');
        const ast = parse(sourceCode)
        return (ast && this.isDatatypeFromContent(ast))? ast : undefined;
    }

    public static isDatatypeFromPath(path: string): boolean {
        //TODO: Decide what types of files to accept as "relevant"
        return path.endsWith('.ts');
    }

    private static isDatatypeFromContent(ast: AST<any>): boolean {
        //TODO: Decide what types of files to accept as "relevant"
        return true;
    }

}