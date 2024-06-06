import {Datatype} from "../extraction/model/datatype";
import ts from "typescript";
import {consola} from "consola";

export class MainDatatypeAnalyser {

    sumOfDatatypesAll: number = 0
    sumOfDatatypesUniqueName: number = 0
    sumOfDatatypesUniqueContent: number = 0
    sumOfDatatypesUniqueContentIgnoringTypes: number = 0;
    sumOfPropertiesAll: number = 0
    sumOfPropertiesUnique: number = 0

    diagnostics: ts.Diagnostic[] = []

    public analyseDatatypes(datatypes: Datatype[], mode: 'fast' | 'deep'): ts.Diagnostic[] {
        // start analysis
        this.sumOfDatatypesAll = datatypes.length
        this.checkDatatypesUniqueName(datatypes)
        this.sumOfDatatypesUniqueName = this.getSumOfDatatypesUniqueName(datatypes)
        this.sumOfDatatypesUniqueContent = this.getSumOfDatatypesUniqueContent(datatypes)
        this.sumOfDatatypesUniqueContentIgnoringTypes = this.getSumOfDatatypesUniqueContentIgnoringTypes(datatypes)
        this.sumOfPropertiesAll = datatypes.map((datatype) => datatype.properties.length).reduce((a, b) => a + b, 0)
        this.sumOfPropertiesUnique = this.getSumOfPropertiesUnique(datatypes)

        this.outputResults()

        return this.diagnostics
    }

    private checkDatatypesUniqueName(datatypes: Datatype[]): void {
        for (let i = 0; i < datatypes.length; i++) {
            for (let j = i + 1; j < datatypes.length; j++) {
                // for all pair of datatypes check if the name and attributes are unique
                if (datatypes[i].name === datatypes[j].name) {
                    const t = datatypes[i]
                    this.diagnostics.push({
                        file: t.nameObject.getSourceFile(),
                        start: t.nameObject.getStart(),
                        length: t.nameObject.getEnd() - t.nameObject.getStart(),
                        messageText: `Datatype name "${t.name}" is not unique!`,
                        category: ts.DiagnosticCategory.Warning,
                        code: 777,
                        source: 'DatatypeAnalyser'
                    })
                }
                const propertiesI = datatypes[i].properties.map((property) => property.name)
                const propertiesJ = datatypes[j].properties.map((property) => property.name)
                if (this.arrayCompare(propertiesI, propertiesJ)) {
                    const t_i = datatypes[i]
                    const t_j = datatypes[j]
                    this.diagnostics.push({
                        file: t_i.nameObject.getSourceFile(),
                        start: t_i.nameObject.getStart(),
                        length: (t_i.nameObject.getEnd() - t_i.nameObject.getStart())? (t_i.nameObject.getEnd() - t_i.nameObject.getStart()) : 10,
                        messageText: `Datatype content is not Unique! Found in:\n- ${t_i.path}\n- ${t_j.path}`,
                        category: ts.DiagnosticCategory.Warning,
                        code: 777,
                        source: 'DatatypeAnalyser'
                    })
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
        consola.box(`Evaluation of Datatypes:\n\n`
            + ` - Number of Datatypes found: ${this.sumOfDatatypesAll}\n`
            + ` - That many datatypes have the same name: ${this.sumOfDatatypesAll - this.sumOfDatatypesUniqueName}\n`
            + ` - So that is the percentage of uniquely named datatypes: ${(this.sumOfDatatypesUniqueName / this.sumOfDatatypesAll * 100).toFixed(2)}%\n\n`

            + ` - That many datatypes have the same content: ${this.sumOfDatatypesAll - this.sumOfDatatypesUniqueContent}\n`
            + ` - So that is the percentage of datatypes with unique content: ${(this.sumOfDatatypesUniqueContent / this.sumOfDatatypesAll * 100).toFixed(2)}%\n\n`

            + ` - Let us ignore the types for a moment:\n`
            + ` - That many datatypes have the same content regarding the property names: ${this.sumOfDatatypesAll - this.sumOfDatatypesUniqueContentIgnoringTypes}\n`
            + ` - So that is the new percentage of datatypes with unique content: ${(this.sumOfDatatypesUniqueContentIgnoringTypes / this.sumOfDatatypesAll * 100).toFixed(2)}%\n\n`

            + ` - Number of Properties found: ${this.sumOfPropertiesAll}\n`
            + ` - You have used that many unique properties with regards to name and type: ${this.sumOfPropertiesUnique}\n`
            + ` - That mean this percentage: ${(this.sumOfPropertiesUnique / this.sumOfPropertiesAll * 100).toFixed(2)}%\n`)
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