@testDecoratorClass
export class Foo {
    bar: string;
    bur: number;
    @testDecoratorProperty
    bor: boolean;
    bir: Date;
}

function testDecoratorClass(constructor: Function) { }

function testDecoratorProperty(parent: Foo, constructor: string) { }