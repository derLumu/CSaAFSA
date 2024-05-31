import {Endpoint} from "../extraction/model/endpoint";
import {ExceptionAnalysis} from "./mainEndpointAnalyser";

export class ExceptionEndpointAnalyser {

    static analyseEndpoint(endpoint: Endpoint): ExceptionAnalysis {
        return { exceptionsThrown: 0, exceptionsUnhandled: 0 }
    }

}