import {Datatype} from "../extraction/model/datatype";

export class MainDatatypeAnalyser {

    sumOfDatatypesAll: number = 0
    sumOfDatatypesUniqueName: number = 0
    sumOfDatatypesUniqueContent: number = 0
    sumOfDatatypesUniqueContentIgnoringTypes: number = 0;
    sumOfPropertiesAll: number = 0
    sumOfPropertiesUnique: number = 0

    public analyseDatatypes(datatypes: Datatype[], mode: 'fast' | 'deep'): void {
        // start analysis
        this.sumOfDatatypesAll = datatypes.length
        this.checkDatatypesUniqueName(datatypes)
        this.sumOfDatatypesUniqueName = this.getSumOfDatatypesUniqueName(datatypes)
        this.sumOfDatatypesUniqueContent = this.getSumOfDatatypesUniqueContent(datatypes)
        this.sumOfDatatypesUniqueContentIgnoringTypes = this.getSumOfDatatypesUniqueContentIgnoringTypes(datatypes)
        this.sumOfPropertiesAll = datatypes.map((datatype) => datatype.properties.length).reduce((a, b) => a + b, 0)
        this.sumOfPropertiesUnique = this.getSumOfPropertiesUnique(datatypes)

        this.outputResults()
    }

    private checkDatatypesUniqueName(datatypes: Datatype[]): void {
        for (let i = 0; i < datatypes.length; i++) {
            for (let j = i + 1; j < datatypes.length; j++) {
                // for all pair of datatypes check if the name and attributes are unique
                if (datatypes[i].name === datatypes[j].name) {
                    console.warn(`Datatype with name "${datatypes[i].name}" is not unique! Name found in:\n- ${datatypes[i].path}\n- ${datatypes[j].path}\n`)
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
                .map((property) => property.name + "," + property.typeId))
            .map((properties) => properties.sort().toString()))
            .size;
    }

    private getSumOfDatatypesUniqueContentIgnoringTypes(datatypes: Datatype[]): number {
        return new Set(datatypes
            .map((datatype) => datatype.properties
                .map((property) => property.name))
            .map((properties) => properties.sort().toString()))
            .size;
    }

    private getSumOfPropertiesUnique(datatypes: Datatype[]): number {
        // use a set here to avoid duplicates. Concat the name and the type id with "," to ensure uniqueness
        return new Set(datatypes.flatMap((datatype) => datatype.properties.map((property) => property.name + "," + property.typeId))).size
    }

    private outputResults(): void {
        console.log(`----------------------------------------------------------------------------\n`
            + `Evaluation of Datatypes:\n`
            + `Sum of Datatypes: ${this.sumOfDatatypesAll}\n`
            + `Sum of Unique Datatypes (Name): ${this.sumOfDatatypesUniqueName}\n`
            + `Boilerplate Score (Name): ${this.sumOfDatatypesUniqueName / this.sumOfDatatypesAll * 100}%\n`
            + `Sum of Unique Datatypes (Content): ${this.sumOfDatatypesUniqueContent}\n`
            + `Boilerplate Score (Content): ${this.sumOfDatatypesUniqueContent / this.sumOfDatatypesAll * 100}%\n`
            + `Sum of Unique Datatypes (Content, ignoring Types): ${this.sumOfDatatypesUniqueContentIgnoringTypes}\n`
            + `Boilerplate Score (Content, ignoring Types): ${this.sumOfDatatypesUniqueContentIgnoringTypes / this.sumOfDatatypesAll * 100}%\n`
            + `Sum of Properties: ${this.sumOfPropertiesAll}\n`
            + `Sum of Unique Properties (Name and Type): ${this.sumOfPropertiesUnique}\n`
            + `Boilerplate Score (Name and Type): ${this.sumOfPropertiesUnique / this.sumOfPropertiesAll * 100}%\n`
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