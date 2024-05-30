import fs from 'fs';
import path from 'path';
import {ContentChecker} from "./contentChecker";

//@see https://gist.github.com/erikvullings/c7eed546a4be0ba43532f8b83048ef38

export const walk = (
    dir: string,
    done: (err: Error | null, results?: string[]) => void,
    filterFile?: (f: string) => boolean,
    filterDirectory?: (f: string) => boolean
) => {
    let results: string[] = [];
    fs.readdir(dir, (err: Error | null, list: string[]) => {
        if (err) {
            return done(err);
        }
        let pending = list.length;
        if (!pending || (filterDirectory && !filterDirectory(dir))) {
            return done(null, results);
        }
        list.forEach((file: string) => {
            file = path.resolve(dir, file);
            fs.stat(file, (err2, stat) => {
                if (stat.isDirectory()) {
                    walk(file, (err3, res) => {
                        if (res) {
                            results = results.concat(res);
                        }
                        if (!--pending) {
                            done(null, results);
                        }
                    }, filterFile, filterDirectory);
                } else {
                    if (typeof filterFile === 'undefined' || (filterFile && filterFile(file))) {
                        results.push(file);
                    }
                    if (!--pending) {
                        done(null, results);
                    }
                }
            });
        });
    });
};

export const filterDatatypeFromPath = (f: string) => {
    return ContentChecker.isRelevantFromPath(f);
};

export const filterDirectoryFromPath = (f: string) => {
    return ContentChecker.isRelevantFromDirectory(f);
};