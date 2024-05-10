import * as fs from 'fs';
import { parse } from '@typescript-eslint/typescript-estree';

const inputFile = "./analytics/src/assets/test.ts";
const sourceCode = fs.readFileSync(inputFile, 'utf-8');

const ast = parse(sourceCode);
console.log(JSON.stringify(ast, null, 2));