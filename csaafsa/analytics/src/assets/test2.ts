import {Foo} from "./test";

export class Sample {
    main() {
        Bar.barMethode()
    }
}

export class Bar {
    static async barMethode() {
        this.ExceptionMethode()
        const f = this.ExceptionMethode();
        this.ExceptionMethode().split(",")
        const s = new Sample()
        s.main;
        await s.main;
        return this.ExceptionMethode();
    }

    static ExceptionMethode(): string {
        return "test,test"
    }
}

export class AttributeOnlyClass {
    privateName: string;
    age: number;
    dayOfBirth: Date;
    decoratorAttribute: number;
    classAttribute: Foo;
}