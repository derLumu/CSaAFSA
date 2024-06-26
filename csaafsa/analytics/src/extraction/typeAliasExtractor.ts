import ts from "typescript";
import {Extractor} from "./extractor";
import {Datatype, DatatypeProperty} from "./model/datatype";

export class TypeAliasExtractor extends Extractor{

    public static extractDatatypeFromAlias(alias: ts.TypeAliasDeclaration, checker: ts.TypeChecker): Datatype {
        const astProperties: ts.Symbol[] = checker.getTypeAtLocation(alias)?.getProperties()
        const properties: DatatypeProperty[] = astProperties.map((property) => this.astPropertyToDatatypeProperty(property, checker));

        return {
            name: alias.name.getText(),
            nameObject: alias.name,
            decorators: this.extractDecorators(alias),
            properties: properties,
            path: alias.getSourceFile().fileName
        };
    }

    private static astPropertyToDatatypeProperty(property: ts.Symbol, checker: ts.TypeChecker): DatatypeProperty {
        return {
            name: property.name,
            typeId: (property as unknown as {id: number}).id,
            decorators: []
        }
    }
}