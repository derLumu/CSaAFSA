import {Endpoint} from "../extraction/model/endpoint";
import {ExceptionEndpointAnalyser} from "./exceptionEndpointAnalyser";
import ts from "typescript";
import { consola, createConsola } from "consola";

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
        consola.box(`Here is your Evaluation of Endpoints:\n\n`
            + ` - Number of Endpoints found: ${this.sumOfEndpoints}\n`
            + ` - I found this many Endpoints with the same method name: ${(this.sumOfEndpoints - this.sumOfEndpointsUniqueName)}\n`
            + ` - That is the percentage of unique named endpoints: ${(this.sumOfEndpointsUniqueName / this.sumOfEndpoints * 100).toFixed(2)}%\n\n`

            + ` - I found this many Endpoints with the same url: ${this.sumOfEndpoints - this.sumOfEndpointsUniqueUrl}\n`
            + ` - That is the percentage of unique url endpoints: ${(this.sumOfEndpointsUniqueUrl / this.sumOfEndpoints * 100).toFixed(2)}%\n\n`

            + ` - You have thrown this many Exceptions: ${this.exceptionAnalysis.exceptionsThrown}\n`
            + ` - And this is the Number of handled Exceptions: ${this.exceptionAnalysis.exceptionsThrown - this.exceptionAnalysis.exceptionsUnhandled}\n`
            + ` - That is the percentage of handled exceptions: ${((this.exceptionAnalysis.exceptionsThrown - this.exceptionAnalysis.exceptionsUnhandled) / this.exceptionAnalysis.exceptionsThrown * 100).toFixed(2)}%\n`
        )
    }
}