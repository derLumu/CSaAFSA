import {Foo} from "./test";

export class Sample {
    public static main() {
        Bar.barMethode()
    }
}

export class Bar {
    static barMethode() {
        return 'bar';
    }
}

export class AttributeOnlyClass {
    privateName: string;
    age: number;
    dayOfBirth: Date;
    decoratorAttribute: number;
    classAttribute: Foo;
}