import {DatatypeExtractor} from "../extraction/datatypeExtractor";

export function getEditsForRefactor(positionOrRange: ts.TextRange | number, sourceFile: ts.SourceFile, fileName: string): ts.RefactorEditInfo {
    const position = typeof positionOrRange === "number" ? positionOrRange : positionOrRange.pos;
    const classOfCaller = DatatypeExtractor.getParentClassFromPosition(position, sourceFile);
    if (!classOfCaller) { return { edits: [] } }
    const className = classOfCaller?.name.escapedText;
    const newEdit: ts.FileTextChanges = {
        fileName: fileName,
        textChanges: [{
            newText: `\n\nexport type Create${className} = Partial<${className}>`,
            span: {
                start: classOfCaller.end,
                length: 0,
            }
        }]
    }
    return { edits: [newEdit] };
}
