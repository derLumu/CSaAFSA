import {Decorator} from "@swc/core";

export class Datatype {
    public name: string;
    public decorators: Decorator[]; //captures decorators on the class, not the key
    public properties: DatatypeProperty[];

    public path: string;
}

export class DatatypeProperty {
    public name: string;
    public type: string;
    public decorators: Decorator[]; //captures decorators on the property, not the key
}