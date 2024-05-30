export class Foo {
    static fooMethode() {
        return 'foo';
    }
}

@BaseDecorator
export class AttributeOnlyClass {
    private privateName: string;
    age: number;
    dayOfBirth: Date;
    @format()
    decoratorAttribute: string;
    classAttribute: Foo;
}

export function format() {
    return function ( target: any, propertyKey: string) {
    }
}

function BaseDecorator(ctr: Function) {

}
