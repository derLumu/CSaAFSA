import {DatatypeExtractor} from "../extraction/datatypeExtractor";

export function getEditsForRefactor(positionOrRange: ts.TextRange | number, sourceFile: ts.SourceFile, fileName: string): ts.RefactorEditInfo {
    const newEdits = []
    // dto generation
    const position = typeof positionOrRange === "number" ? positionOrRange : positionOrRange.pos;
    const classOfCaller = DatatypeExtractor.getParentClassFromPosition(position, sourceFile);
    if (!classOfCaller) { return { edits: [] } }
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

    // exception updates
    //TODO: add exception updates

    return { edits: newEdits };
}
