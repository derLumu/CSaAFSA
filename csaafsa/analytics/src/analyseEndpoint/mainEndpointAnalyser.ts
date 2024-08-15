import {ApiCall, Endpoint, FoundException} from "../extraction/model/endpoint";
import {ExceptionEndpointAnalyser} from "./exceptionEndpointAnalyser";
import ts from "typescript";
import {consola} from "consola";
import {HandledExceptionEndpointAnalyser} from "./handledExectionEndpointAnalyser";

export class ExceptionAnalysis {
    exceptionsThrown: FoundException[] = [];
    exceptionsUnhandled: FoundException[] = [];
    exceptionsUnhandledCount: number = 0;
    exceptionsHandledNotThrown: string[] = [];
    diagnostics: ts.Diagnostic[] = []
}

export class MainEndpointAnalyser {

    sumOfEndpoints: number = 0;
    sumOfEndpointsUniqueName: number = 0;
    sumOfEndpointsUniqueUrl: number = 0;
    sumOfUnusedEndpoints: number = 0;
    exceptionAnalysis: ExceptionAnalysis = { exceptionsThrown: [], exceptionsUnhandledCount: 0, exceptionsUnhandled: [], exceptionsHandledNotThrown: [], diagnostics: []}

    diagnostics: ts.Diagnostic[] = []

    public analyseEndpoints(endpoints: Endpoint[], checker: ts.TypeChecker, apiCalls: ApiCall[], inputConfig: string): ts.Diagnostic[] {
        // start analysis
        this.sumOfEndpoints = endpoints.length
        this.checkEndpointsUniqueNameAndUrl(endpoints)
        this.sumOfEndpointsUniqueName = this.getSumOfEndpointsUniqueName(endpoints)
        this.sumOfEndpointsUniqueUrl = this.getSumOfEndpointsUniqueUrl(endpoints)
        endpoints = this.extractNestedHandledExceptions(endpoints, checker)
        this.exceptionAnalysis = this.analyseExceptionHandling(endpoints, checker, inputConfig)

        // only analyse FE if there are calls to analyse
        apiCalls.length > 0 && (this.sumOfUnusedEndpoints = this.getSumOfUnusedEndpoints(endpoints, apiCalls))
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
                        length: (t.methodObject.name.getEnd() - t.methodObject.name.getStart()) ? (t.methodObject.name.getEnd() - t.methodObject.name.getStart()) : 10,
                        messageText: `Endpoint name "${t.name}" is not unique!`,
                        category: ts.DiagnosticCategory.Warning,
                        code: 705,
                        source: 'EndpointAnalyser'
                    })
                }
                if (endpoints[i].type + "," + endpoints[i].url === endpoints[j].type + "," + endpoints[j].url) {
                    const t = endpoints[i]
                    this.diagnostics.push({
                        file: t.methodObject.getSourceFile(),
                        start: t.methodObject.name.getStart(),
                        length: (t.methodObject.name.getEnd() - t.methodObject.name.getStart()) ? (t.methodObject.name.getEnd() - t.methodObject.name.getStart()) : 10,
                        messageText: `Endpoint url "${t.url}" is not unique! Found in:\n- ${t.filePath}\n- ${endpoints[j].filePath}`,
                        category: ts.DiagnosticCategory.Warning,
                        code: 706,
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

    private analyseExceptionHandling(endpoints: Endpoint[], checker: ts.TypeChecker, inputConfig: string): ExceptionAnalysis {
        const exceptionAnalysis = endpoints.map((endpoint) => new ExceptionEndpointAnalyser(checker).analyseEndpoint(endpoint, inputConfig))
        return {
            exceptionsThrown: exceptionAnalysis.map((a) => a.exceptionsThrown).reduce((sum, current) => sum.concat(current), []),
            exceptionsUnhandled: exceptionAnalysis.map((a) => a.exceptionsUnhandled).reduce((sum, current) => sum.concat(current), []),
            exceptionsUnhandledCount: exceptionAnalysis.map((a) => a.exceptionsUnhandledCount).reduce((sum, current) => sum + current, 0),
            exceptionsHandledNotThrown: exceptionAnalysis.map((a) => a.exceptionsHandledNotThrown).reduce((sum, current) => sum.concat(current), []),
            diagnostics: exceptionAnalysis.map((a) => a.diagnostics).reduce((sum, current) => sum.concat(current), [])
        }
    }

    private extractNestedHandledExceptions(endpoints: Endpoint[], checker: ts.TypeChecker): Endpoint[] {
        return endpoints.map((endpoint) => new HandledExceptionEndpointAnalyser(checker).analyseEndpoint(endpoint))
    }

    public outputResults() {
        consola.box(`Here is your Evaluation of Endpoints:\n\n`
            + ` - Number of Endpoints found: ${this.sumOfEndpoints}\n`
            + ` - I found this many Endpoints with the same method name: ${(this.sumOfEndpoints - this.sumOfEndpointsUniqueName)}\n`
            + ` - That is the percentage of unique named endpoints: ${(this.sumOfEndpointsUniqueName / this.sumOfEndpoints * 100).toFixed(2)}%\n\n`

            + ` - I found this many Endpoints with the same url: ${this.sumOfEndpoints - this.sumOfEndpointsUniqueUrl}\n`
            + ` - That is the percentage of unique url endpoints: ${(this.sumOfEndpointsUniqueUrl / this.sumOfEndpoints * 100).toFixed(2)}%\n\n`

            + ` - Looking at your Frontend you have this many unused Endpoints: ${this.sumOfUnusedEndpoints}\n`
            + ` - That is the percentage of used endpoints: ${((this.sumOfEndpoints - this.sumOfUnusedEndpoints) / this.sumOfEndpoints * 100).toFixed(2)}%\n\n`

            + ` - You have thrown this many Exceptions: ${this.exceptionAnalysis.exceptionsThrown.length}\n`
            + ` - And this is the Number of handled Exceptions: ${this.exceptionAnalysis.exceptionsThrown.length - this.exceptionAnalysis.exceptionsUnhandledCount}\n`
            + ` - That is the percentage of handled exceptions: ${((this.exceptionAnalysis.exceptionsThrown.length - this.exceptionAnalysis.exceptionsUnhandledCount) / this.exceptionAnalysis.exceptionsThrown.length * 100).toFixed(2)}%\n`
            + ` - By the way, this many exception were handled but never thrown: ${this.exceptionAnalysis.exceptionsHandledNotThrown.length}\n`
        )
    }

    private getSumOfUnusedEndpoints(endpoints: Endpoint[], apiCalls: ApiCall[]) {
        let counter = 0;
        endpoints.forEach((endpoint) => {
            const endpointSplit = endpoint.url.split("/").map((e) => e.replace(/["']/g, "")).filter((e) => e !== "" && !e.startsWith(":"))
            const calls = apiCalls.filter((call) => call.method.toLowerCase() === endpoint.type.toLowerCase())
                .filter((call) => endpointSplit.every((e) => call.url.includes(e)))

            if (calls.length === 0) {
                counter++
                this.diagnostics.push({
                    file: endpoint.methodObject.getSourceFile(),
                    start: endpoint.methodObject.name.getStart(),
                    length: (endpoint.methodObject.name.getEnd() - endpoint.methodObject.name.getStart()) ? (endpoint.methodObject.name.getEnd() - endpoint.methodObject.name.getStart()) : 10,
                    messageText: `Endpoint not used in frontend!`,
                    category: ts.DiagnosticCategory.Warning,
                    code: 707,
                    source: 'EndpointAnalyser'
                })
            }
        })
        return counter;
    }
}