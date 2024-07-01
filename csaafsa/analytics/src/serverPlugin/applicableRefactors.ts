import {DatatypeExtractor} from "../extraction/datatypeExtractor";
import ts from "typescript";

export const GENERAL_REFACTOR_NAME = "Generate Update";
export const GENERAL_REFACTOR_DESCRIPTION = "Generate Update DTO";
export const UPDATE_DTO_REFACTOR_NAME = "Generate Update";
export const UPDATE_DTO_REFACTOR_DESCRIPTION = "Generate Update DTO";
export const UPDATE_DTO_REFACTOR_KIND = "analytics.generateUpdateDTO";
export const UPDATE_DTO_REFACTOR_REASON = "No class found at the current position";

export function getApplicableRefactors (sourceFile: ts.SourceFile, positionOrRange: ts.TextRange | number): ts.ApplicableRefactorInfo {
    const actions: ts.RefactorActionInfo[] = [];
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

    // exception updates
    //TODO: add exception updates

    return {
        name: GENERAL_REFACTOR_NAME,
        description: GENERAL_REFACTOR_DESCRIPTION,
        actions: actions
    };
}