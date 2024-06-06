import {Endpoint} from "../extraction/model/endpoint";
import {ExceptionEndpointAnalyser} from "./exceptionEndpointAnalyser";
import ts from "typescript";

export class ExceptionAnalysis {
    exceptionsThrown: number = 0;
    exceptionsUnhandled: number = 0;
    diagnostics: ts.Diagnostic[] = []
}

export class MainEndpointAnalyser {

    sumOfEndpoints: number = 0;
    sumOfEndpointsUniqueName: number = 0;
    sumOfEndpointsUniqueUrl: number = 0;
    exceptionAnalysis: ExceptionAnalysis = { exceptionsThrown: 0, exceptionsUnhandled: 0, diagnostics: []}

    diagnostics: ts.Diagnostic[] = []

    public analyseEndpoints(endpoints: Endpoint[], checker: ts.TypeChecker, projectFiles: string[], mode: 'fast' | 'deep'): ts.Diagnostic[] {
        // start analysis
        this.sumOfEndpoints = endpoints.length
        this.checkEndpointsUniqueNameAndUrl(endpoints)
        this.sumOfEndpointsUniqueName = this.getSumOfEndpointsUniqueName(endpoints)
        this.sumOfEndpointsUniqueUrl = this.getSumOfEndpointsUniqueUrl(endpoints)
        this.exceptionAnalysis = this.analyseExceptionHandling(endpoints, checker, projectFiles)

        this.outputResults()
        return [...this.diagnostics, ...this.exceptionAnalysis.diagnostics]
    }

    private checkEndpointsUniqueNameAndUrl(endpoints: Endpoint[]) {
        for (let i = 0; i < endpoints.length; i++) {
            for (let j = i + 1; j < endpoints.length; j++) {
                // for all pair of datatypes check if the name and url are unique
                if (endpoints[i].name === endpoints[j].name) {
                    const t = endpoints[i]
                    this.diagnostics.push({
                        file: t.methodObject.getSourceFile(),
                        start: t.methodObject.name.getStart(),
                        length: t.methodObject.name.getEnd() - t.methodObject.name.getStart(),
                        messageText: `Endpoint name "${t.name}" is not unique!`,
                        category: ts.DiagnosticCategory.Warning,
                        code: 778,
                        source: 'EndpointAnalyser'
                    })
                }
                if (endpoints[i].type + "," + endpoints[i].url === endpoints[j].type + "," + endpoints[j].url) {
                    const t = endpoints[i]
                    this.diagnostics.push({
                        file: t.methodObject.getSourceFile(),
                        start: t.methodObject.name.getStart(),
                        length: t.methodObject.name.getEnd() - t.methodObject.name.getStart(),
                        messageText: `Endpoint url "${t.url}" is not unique! Found in:\n- ${t.filePath}\n- ${endpoints[j].filePath}`,
                        category: ts.DiagnosticCategory.Warning,
                        code: 778,
                        source: 'EndpointAnalyser'
                    })
                }
            }
        }
    }

    private getSumOfEndpointsUniqueName(endpoints: Endpoint[]) {
        return new Set(endpoints.map((endpoint) => endpoint.name)).size;
    }

    private getSumOfEndpointsUniqueUrl(endpoints: Endpoint[]) {
        return new Set(endpoints.map((endpoint) => endpoint.type + "," + endpoint.url)).size;
    }

    private analyseExceptionHandling(endpoints: Endpoint[], checker: ts.TypeChecker, projectFiles: string[]): ExceptionAnalysis {
        const exceptionAnalysis = endpoints.map((endpoint) => new ExceptionEndpointAnalyser(checker, projectFiles).analyseEndpoint(endpoint))
        return {
            exceptionsThrown: exceptionAnalysis.map((a) => a.exceptionsThrown).reduce((sum, current) => sum + current, 0),
            exceptionsUnhandled: exceptionAnalysis.map((a) => a.exceptionsUnhandled).reduce((sum, current) => sum + current, 0),
            diagnostics: exceptionAnalysis.map((a) => a.diagnostics).reduce((sum, current) => sum.concat(current), [])
        }

    }

    private outputResults() {
        console.log(`----------------------------------------------------------------------------\n`
            + `Evaluation of Endpoints:\n`
            + `Sum of Endpoints: ${this.sumOfEndpoints}\n`
            + `Sum of Unique Endpoints (Name): ${this.sumOfEndpointsUniqueName}\n`
            + `Boilerplate Score (Name): ${this.sumOfEndpointsUniqueName / this.sumOfEndpoints * 100}%\n`
            + `Sum of Unique Endpoints (URL): ${this.sumOfEndpointsUniqueUrl}\n`
            + `Boilerplate Score (Content): ${this.sumOfEndpointsUniqueUrl / this.sumOfEndpoints * 100}%\n`
            + `Sum Exceptions thrown: ${this.exceptionAnalysis.exceptionsThrown}\n`
            + `Sum Exceptions handled: ${this.exceptionAnalysis.exceptionsThrown - this.exceptionAnalysis.exceptionsUnhandled}\n`
            + `Handling Score (Exceptions): ${(this.exceptionAnalysis.exceptionsThrown - this.exceptionAnalysis.exceptionsUnhandled) / this.exceptionAnalysis.exceptionsThrown * 100}%\n`
            + `----------------------------------------------------------------------------\n`)
    }
}