'use strict';

const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const [ srcFile, buildFile ] = args;
const compare = require('./lib/compare');

const readFile = (filePath) => {
    const absolutePath = path.resolve(process.cwd(), filePath);

    return new Promise((resolve, reject) => {
        fs.readFile(absolutePath, 'utf8', (err, fileContent) => {
            if (err) {
                reject(err);
            }

            resolve(fileContent);
        });
    });
};

const compareFiles = (fileA, fileB) => {
    Promise.all(
        [
            readFile(fileA),
            readFile(fileB)
        ])
        .then(files => {
            console.log(`Shortest edit distance between compiled script subsequence and source:`, compare(...files));
        });
};

compareFiles(srcFile, buildFile);

module.exports.compare = compare;
