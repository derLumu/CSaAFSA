import {DatatypeExtractor} from "../extraction/datatypeExtractor";
import ts from "typescript";
import {ExceptionRefactorCollector} from "./exceptionRefactorCollector";

export const EXCEPTIONS_REFACTOR_NAME = "Fix exceptions";
export const EXCEPTIONS_REFACTOR_DESCRIPTION = "Fix unhandled exceptions";
export const EXCEPTIONS_REFACTOR_KIND = "analytics.fixExceptions";

export const UPDATE_DTO_REFACTOR_NAME = "Generate Update";
export const UPDATE_DTO_REFACTOR_DESCRIPTION = "Generate Update DTO";
export const UPDATE_DTO_REFACTOR_KIND = "analytics.generateUpdateDTO";
export const UPDATE_DTO_REFACTOR_REASON = "No class found at the current position";

export function getApplicableRefactors (sourceFile: ts.SourceFile, positionOrRange: ts.TextRange | number, inputConfig: string): ts.ApplicableRefactorInfo {
    const actions: ts.RefactorActionInfo[] = [];
    // exception updates
    const unhandledExceptions = ExceptionRefactorCollector.collectUnhandled(sourceFile, positionOrRange, inputConfig);
    if (unhandledExceptions.exception.length > 0) {
        actions.push({
            name: EXCEPTIONS_REFACTOR_NAME,
            description: EXCEPTIONS_REFACTOR_DESCRIPTION,
            kind: EXCEPTIONS_REFACTOR_KIND,
            notApplicableReason: undefined
        });
        return {
            name: EXCEPTIONS_REFACTOR_NAME,
            description: EXCEPTIONS_REFACTOR_DESCRIPTION,
            actions: actions
        };
    }

    // dto generation
    const position = typeof positionOrRange === "number" ? positionOrRange : positionOrRange.pos;
    const classOfCaller = DatatypeExtractor.getParentClassFromPosition(position, sourceFile);
    const reason = (!classOfCaller || (classOfCaller.members as ts.NodeArray<any>)
        .find((member) => member.kind !== ts.SyntaxKind.PropertyDeclaration && member.kind !== ts.SyntaxKind.PropertySignature))
        ? UPDATE_DTO_REFACTOR_REASON
        : undefined;
    actions.push({
            name: UPDATE_DTO_REFACTOR_NAME,
            description: UPDATE_DTO_REFACTOR_DESCRIPTION,
            kind: UPDATE_DTO_REFACTOR_KIND,
            notApplicableReason: reason
    });

    return {
        name: UPDATE_DTO_REFACTOR_NAME,
        description: UPDATE_DTO_REFACTOR_DESCRIPTION,
        actions: actions
    };
}