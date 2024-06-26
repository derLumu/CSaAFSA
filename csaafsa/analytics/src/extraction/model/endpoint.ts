import ts from "typescript";

export class Endpoint {
    name: string;
    type: "Get" | "Head" | "Post" | "Put" | "Patch" | "Delete" | "Connect" | "Options" | "Trace";
    url: string;
    handledExceptions: string[];
    methodObject:  ts.MethodDeclaration;

    filePath: string;
}

export class FoundException {
    name: string;
    throwNode: ts.Node;
}

export class ApiCall {
    method: string;
    url: string;
    filePath: string;
}