import {AST} from "@typescript-eslint/typescript-estree";
import {Datatype, DatatypeProperty} from "./model/datatype";

export class DatatypeExtractor {

    public static extractDatatypes(ast: AST<any>, path: string): Datatype[] {
        return ast.body.map((node: any) => this.extractDatatype(node, path)).filter((datatype) => datatype !== undefined) as Datatype[];
    }

    private static extractDatatype(node: any, path: string): Datatype | undefined {
        if (node.type === 'ExportNamedDeclaration' && node.declaration.type === 'ClassDeclaration') {
            const classObject = node.declaration;
            const classBody = classObject.body.body;

            if (classBody.length == 0 ||
                classBody.map((i) => i.type).find((i) => i !== 'PropertyDefinition')) { return undefined }

            const properties = classBody
                .map((property) => this.extractDatatypeProperty(property))
                .filter((property) => property !== undefined) as DatatypeProperty[];
            const decorators = classObject.decorators;

            return {
                name: classObject.id.name,
                decorators: decorators,
                properties: properties,
                path: path
            } as Datatype;
        }
        return undefined;
    }

    private static extractDatatypeProperty(node: any): DatatypeProperty | undefined {
        let type: string;
        if (node.typeAnnotation.typeAnnotation.type === 'TSTypeReference') {
            type = node.typeAnnotation.typeAnnotation.typeName.name;
        } else {
            type = node.typeAnnotation.typeAnnotation.type;
        }
        const decorators = node.decorators;

        return {
            name: node.key.name,
            type: type,
            decorators: decorators
        } as DatatypeProperty;
    }
}