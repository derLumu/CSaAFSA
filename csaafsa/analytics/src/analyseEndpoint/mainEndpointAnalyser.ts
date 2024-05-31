import {Endpoint} from "../extraction/model/endpoint";
import {ExceptionEndpointAnalyser} from "./exceptionEndpointAnalyser";
import ts from "typescript";

export class ExceptionAnalysis {
    exceptionsThrown: number = 0;
    exceptionsUnhandled: number = 0;
}

export class MainEndpointAnalyser {

    sumOfEndpoints: number = 0;
    sumOfEndpointsUniqueName: number = 0;
    sumOfEndpointsUniqueUrl: number = 0;
    exceptionAnalysis: ExceptionAnalysis = { exceptionsThrown: 0, exceptionsUnhandled: 0 }

    public analyseEndpoints(endpoints: Endpoint[], checker: ts.TypeChecker, mode: 'fast' | 'deep'): void {
        // start analysis
        this.sumOfEndpoints = endpoints.length
        this.checkEndpointsUniqueNameAndUrl(endpoints)
        this.sumOfEndpointsUniqueName = this.getSumOfEndpointsUniqueName(endpoints)
        this.sumOfEndpointsUniqueUrl = this.getSumOfEndpointsUniqueUrl(endpoints)
        this.exceptionAnalysis = this.analyseExceptionHandling(endpoints, checker)

        this.outputResults()
    }

    private checkEndpointsUniqueNameAndUrl(endpoints: Endpoint[]) {
        for (let i = 0; i < endpoints.length; i++) {
            for (let j = i + 1; j < endpoints.length; j++) {
                // for all pair of datatypes check if the name and url are unique
                if (endpoints[i].name === endpoints[j].name) {
                    console.warn(`Endpoint with name "${endpoints[i].name}" is not unique! Name found in:\n- ${endpoints[i].filePath}\n- ${endpoints[j].filePath}\n`)
                }
                if (endpoints[i].type + "," + endpoints[i].url === endpoints[j].type + "," + endpoints[j].url) {
                    console.warn(`Endpoint with url "${endpoints[i].name}" is not unique! Name found in:\n- ${endpoints[i].filePath}\n- ${endpoints[j].filePath}\n`)
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

    private analyseExceptionHandling(endpoints: Endpoint[], checker: ts.TypeChecker): ExceptionAnalysis {
        const exceptionAnalysis = endpoints.map((endpoint) => new ExceptionEndpointAnalyser(checker).analyseEndpoint(endpoint))
        return {
            exceptionsThrown: exceptionAnalysis.map((a) => a.exceptionsThrown).reduce((sum, current) => sum + current, 0),
            exceptionsUnhandled: exceptionAnalysis.map((a) => a.exceptionsUnhandled).reduce((sum, current) => sum + current, 0)
        }

    }

    private outputResults() {

    }
}