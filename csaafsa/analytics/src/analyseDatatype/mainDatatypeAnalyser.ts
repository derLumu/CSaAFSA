import {Datatype} from "../extraction/model/datatype";

export class MainDatatypeAnalyser {

    sumOfDatatypesAll: number = 0
    sumOfDatatypesUniqueName: number = 0
    sumOfDatatypesUniqueContent: number = 0

    sumOfPropertiesAll: number = 0
    sumOfPropertiesUnique: number = 0

    public analyseDatatypes(datatypes: Datatype[], mode: 'fast' | 'deep' = 'deep'): void {
        this.sumOfDatatypesAll = datatypes.length

        this.checkDatatypesUniqueName(datatypes)
        this.sumOfDatatypesUniqueName = this.getSumOfDatatypesUniqueName(datatypes)
        this.sumOfDatatypesUniqueContent = this.getSumOfDatatypesUniqueContent(datatypes)

        this.sumOfPropertiesAll = datatypes.map((datatype) => datatype.properties.length).reduce((a, b) => a + b, 0)
        this.sumOfPropertiesUnique = this.getSumOfPropertiesUnique(datatypes)

        this.outputResults()
    }

    private checkDatatypesUniqueName(datatypes: Datatype[]): void {
        for (let i = 0; i < datatypes.length; i++) {
            for (let j = i + 1; j < datatypes.length; j++) {
                if (datatypes[i].name === datatypes[j].name) {
                    console.warn(`Datatype with name "${datatypes[i].name}" is not unique! Found in:\n- ${datatypes[i].path}\n- ${datatypes[j].path}\n`)
                }
                const propertiesI = datatypes[i].properties.map((property) => property.name)
                const propertiesJ = datatypes[j].properties.map((property) => property.name)
                if (this.arrayCompare(propertiesI, propertiesJ)) {
                    console.warn(`Datatype with name "${datatypes[i].name}" and "${datatypes[j].name}" have the same properties! Found in:\n- ${datatypes[i].path}\n- ${datatypes[j].path}\n`)
                }

            }
        }
    }

    private getSumOfDatatypesUniqueName(datatypes: Datatype[]): number {
        return new Set(datatypes.map((datatype) => datatype.name)).size;
    }

    private getSumOfDatatypesUniqueContent(datatypes: Datatype[]): number {
        return new Set(datatypes
            .map((datatype) => datatype.properties
                .map((property) => property.name))
            .map((properties) => properties.sort().toString()))
            .size;
    }

    private getSumOfPropertiesUnique(datatypes: Datatype[]): number {
        return new Set(datatypes.flatMap((datatype) => datatype.properties.map((property) => property.name))).size
    }

    private outputResults(): void {
        console.log(`----------------------------------------------------------------------------\n`
            + `Evaluation of Datatypes:\n`
            + `Sum of Datatypes: ${this.sumOfDatatypesAll}\n`
            + `Sum of Unique Datatypes (Name): ${this.sumOfDatatypesUniqueName}\n`
            + `Boilerplate Score (Name): ${this.sumOfDatatypesUniqueName / this.sumOfDatatypesAll * 100}%\n`
            + `Sum of Unique Datatypes (Content): ${this.sumOfDatatypesUniqueContent}\n`
            + `Boilerplate Score (Content): ${this.sumOfDatatypesUniqueContent / this.sumOfDatatypesAll * 100}%\n`
            + `Sum of Properties: ${this.sumOfPropertiesAll}\n`
            + `Sum of Unique Properties: ${this.sumOfPropertiesUnique}\n`
            + `Boilerplate Score (Properties): ${this.sumOfPropertiesUnique / this.sumOfPropertiesAll * 100}%\n`
            + `----------------------------------------------------------------------------\n`)
    }

    // https://stackoverflow.com/users/4925661/maciej-kravchyk
    private arrayCompare(_arr1: any[], _arr2: any[]): boolean {
        if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length) { return false }
        const arr1 = _arr1.concat().sort();
        const arr2 = _arr2.concat().sort();
        for (let i = 0; i < arr1.length; i++) { if (arr1[i] !== arr2[i]) { return false } }
        return true;
    }
}