import {DatatypeExtractor} from "../extraction/datatypeExtractor";
import {ExceptionRefactorCollector} from "./exceptionRefactorCollector";

export function getEditsForDTORefactor(positionOrRange: ts.TextRange | number, sourceFile: ts.SourceFile, fileName: string): ts.RefactorEditInfo {
    const newEdits = []
    const position = typeof positionOrRange === "number" ? positionOrRange : positionOrRange.pos;
    const classOfCaller = DatatypeExtractor.getParentClassFromPosition(position, sourceFile);
    if (classOfCaller) {
        const className = classOfCaller?.name.escapedText;
        newEdits.push({
            fileName: fileName,
            textChanges: [{
                newText: `\n\nexport type Update${className} = Partial<${className}>`,
                span: {
                    start: classOfCaller.end,
                    length: 0,
                }
            }]
        })
    }
    return { edits: newEdits };

}

export function getEditsForExceptionRefactor(positionOrRange: ts.TextRange | number, sourceFile: ts.SourceFile, fileName: string, inputConfig: string): ts.RefactorEditInfo {
    const newEdits = []
    // exception updates
    const unhandledExceptionsWithPosition = ExceptionRefactorCollector.collectUnhandled(sourceFile, positionOrRange, inputConfig);
    if (unhandledExceptionsWithPosition.exception.length > 0) {
        const indentation = sourceFile.getLineAndCharacterOfPosition(unhandledExceptionsWithPosition.method.getStart()).character
        let text = ""
        unhandledExceptionsWithPosition.exception.forEach((exception) => {
            const whitespaces = " ".repeat(indentation)
            const croppedName = exception.name.split('Exception').shift().toUpperCase()
            text += `@TypedException<${exception.name}>(HttpStatus.${croppedName}, "A ${exception.name} accured")\n${whitespaces}`
        })
        newEdits.push({
            fileName: fileName,
            textChanges: [{
                newText: text,
                span: {
                    start: unhandledExceptionsWithPosition.method.name.getStart(),
                    length: 0,
                }
            }]
        })
    }
    return { edits: newEdits };

}
