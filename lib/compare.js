'use strict';

const { SourceLexer, BuildLexer } = require('./lexers');
const smithWaterman = require('./smith-waterman');

const compare = (sourceFile, buildFile) => {
    const buildLexer  = new BuildLexer(buildFile);
    const srcLexer    = new SourceLexer(sourceFile, buildLexer.identifiers, buildLexer.methods);
    // console.log('source tokens:', JSON.stringify(srcLexer.tokens, null, 2));
    // const distance    = getFuzzySubsequenceLength(srcLexer.tokens, buildLexer.tokens);
    // const needleCount = srcLexer.tokens.length;
    // console.log('needleCount:', needleCount);
    console.log('src:', JSON.stringify(srcLexer.tokens, null, 2));
    console.log('\n\n\n\n\n\n\nbuild:', JSON.stringify(buildLexer.tokens, null, 2));
    // console.log('build:', JSON.stringify(buildLexer.tokens, null, 2));
    // const p = smithWaterman.getOptimalLocalAlignment({
    //     seqA: srcLexer.tokens,
    //     seqB: buildLexer.tokens
    // });
    // console.log('alignment:\n', JSON.stringify(p, null, 2));
    // return scoreAlignment(srcLexer.tokens, p);
};

/*Identifier
    Match: 5
    Mismatch : -3
    Hole: -3
Punctuator
    Match: 3
    Mismatch: -2
    Hole: -1
Keyword
    Match: 2
    Mismatch: -1
    Hole: -1
Numeric
    Match: 3
    Mismatch: -5
    Hole: -5
Boolean
    Match: 2
    Mismatch: -1
    Hole: -1
Null
    Match: 2
    Mismatch: -1
    Hole: -1
Regular Expression
    Match: 5
    Mismatch: -3
    Hole: -3
*/
const scoreAlignment = (srcTokens, alignment) => {
    return alignment.filter(pair => pair[0] === pair[1]).length / srcTokens.length;
};

// We need to find the longest common sequence in the build file
// Ideally we would find the longest subsequence with the smallest edit distance

// It might be useful to split the tokens by function, and find the longest common sequences
// that match each function block

// For right now we'll just take the entire file, and find the subsequence of all the compiled code
// with the shortest edit distance to the file. Not perfect, but it should still be informative

// This function calculates the fuzzy levenshtein distance as detailed here:
//http://ginstrom.com/scribbles/2007/12/01/fuzzy-substring-matching-with-levenshtein-distance-in-python/
const getFuzzySubsequenceLength = (needleTokens, haystackTokens) => {
    const m = needleTokens.length;
    const n = haystackTokens.length;

    let thisRow,
        subCost,
        needleToken,
        haystackToken,
        deletion,
        substitution,
        insertion,
        lastRow = new Array(n + 1).fill(0);

    for (let i = 0; i < m; i++) {
        needleToken = needleTokens[i];
        thisRow = [i + 1];

        for (let j = 0; j < n; j++) {
            haystackToken = haystackTokens[j];
            subCost = !isIdenticalToken(needleToken, haystackToken);

            deletion = lastRow[j + 1] + 1;
            insertion = thisRow[j] + 1;
            substitution = lastRow[j] + subCost;

            thisRow.push(Math.min(
                deletion,
                insertion,
                substitution
            ));
        }
        lastRow = thisRow;
    }

    return thisRow.reduce((leastNum, num) => Math.min(leastNum, num));
};

const isIdenticalToken = (tokenA, tokenB) => {
    return tokenA.type === tokenB.type && tokenA.value === tokenB.value;
};

module.exports = compare;
