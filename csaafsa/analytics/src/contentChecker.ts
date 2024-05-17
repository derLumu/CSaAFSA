import {AST} from "@typescript-eslint/typescript-estree";

export class ContentChecker {

    public static isDatatypeFromPath(path: string): boolean {
        //TODO: Decide what types of files to accept as "relevant"
        return path.endsWith('.ts');
    }

    public static isDatatypeFromContent(ast: AST<any>): boolean {
        //TODO: Decide what types of files to accept as "relevant"
        return true;
    }

    public static isEndpointFromPath(path: string): boolean {
        //TODO: Decide what types of files to accept as "relevant"
        return path.endsWith('.ts');
    }

    public static isEndpointFromContent(ast: AST<any>): boolean {
        //TODO: Decide what types of files to accept as "relevant"
        return true;
    }

    public static isRelevantFromPath(path: string): boolean {
        return this.isDatatypeFromPath(path) || this.isEndpointFromPath(path);
    }

    public static isRelevantFromContent(ast: AST<any>): boolean {
        return this.isDatatypeFromContent(ast) || this.isEndpointFromContent(ast);
    }

}