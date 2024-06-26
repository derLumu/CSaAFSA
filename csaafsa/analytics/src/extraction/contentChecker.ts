export class ContentChecker {

    public static isRelevantFromPath(path: string): boolean {
        return !( // Use OR for possible execution shortcuts
            !path.endsWith('.ts') ||
            path.includes('service')
        ) ;
    }

    static isRelevantFromDirectory(dir: string) {
        return !( // Use OR for possible execution shortcuts
            dir.includes('assets') ||
            dir.includes('service')
        ) ;
    }
}