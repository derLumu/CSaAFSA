import ts from "typescript";

export class Datatype {
    public name: string;
    public nameObject: ts.Identifier;
    public decorators: ts.Decorator[];
    public properties: DatatypeProperty[];

    public path: string;
}

export class DatatypeProperty {
    public name: string;
    public typeId: number;
    public decorators: ts.Decorator[];
}