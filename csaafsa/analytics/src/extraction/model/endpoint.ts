import ts from "typescript";

export class Endpoint {
    name: string;
    type: "Get" | "Post" | "Patch" | "Delete";
    url: string;
    decoratorNames: string[];
    statements:  ts.Statement[];

    filePath: string;
}