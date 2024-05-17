import {AST} from "@typescript-eslint/typescript-estree";

export class DatatypeExtractor {

    public static extractDatatypes(ast: AST<any>): string[] {
        return ast.body.map((node: any) => this.extractDatatype(node)).filter((datatype) => datatype !== undefined) as string[];
    }

    private static extractDatatype(node: any): string | undefined {
        if (node.type === 'ExportNamedDeclaration' && node.declaration.type === 'ClassDeclaration') {
            //TODO: Decide what to return
            return node.declaration.id.name;
        }
        return undefined;
    }
}