const esprima = require('esprima');

const immutablePunctuators = new Set([
    '=',
    '===',
    '!==',
    '&&',
    '||',
    '>',
    '/=',
    '/',
    '--',
    '*',
    '<',
    '+=',
    '-=',
    '<=',
    '>=',
    '~',
    '<<',
    '>>',
    '|',
    '&',
    '%',
    '^',
    '*=',
    '%=',
    '>>>',
    '|=',
    '>>=',
    '&='
]);

const mutableKeyword = new Set([
    'var',
    'const',
    'let'
]);

const immutableTokens = new Set([
    'Null',
    'Numeric',
    'RegularExpression'
]);

class Lexer {
    constructor(fileContent) {
        this.rawTokens = esprima.tokenize(fileContent);
    }
}

// Hold on to general 'function' and 'variable' tokens, regardless of keyword use

class SourceLexer extends Lexer {
    constructor(fileContent, globalIdentifiers) {
        super(fileContent);
        let lastTokenValue;
        let doUseToken;
        this.tokens = this.rawTokens.filter(token => {
            const { type, value } = token;

            switch (type) {
                case 'Identifier':
                    doUseToken = globalIdentifiers.has(value) || lastTokenValue === '.';
                    break;

                case 'Punctuator':
                    doUseToken = immutablePunctuators.has(value);
                    break;

                case 'Keyword':
                    doUseToken = !mutableKeyword.has(value);
                    break;

                default:
                    doUseToken = immutableTokens.has(type);
                    break;
            }
            lastTokenValue = value;
            return doUseToken;
        }).map(token => JSON.stringify(token));
    }
}

class BuildLexer extends Lexer {
    constructor(fileContent) {
        super(fileContent);
        const buildIdentifiers = this.identifiers = new Set();
        const methods = this.methods = new Set();
        let lastTokenValue;
        this.tokens = this.rawTokens.filter(token => {
            const { type, value } = token;
            let doUseToken;
            switch (type) {
                case 'Identifier':
                    // his is a heuristic to retain useful global identifiers that won't change on compilation (setTimeout, etc.)
                    if (Boolean(global[value])) {
                        buildIdentifiers.add(value);
                        doUseToken = true;
                    }
                    // We also try to preserve method names, as they do not get minified
                    if (lastTokenValue === '.') {
                        methods.add(value);
                        doUseToken = true;
                    }
                    break;

                case 'Keyword':
                    doUseToken = !mutableKeyword.has(value);
                    break;

                case 'Punctuator':
                    doUseToken = immutablePunctuators.has(value);
                    break;

                default:
                    doUseToken = immutableTokens.has(type);
                    break;
            }
            lastTokenValue = value;
            return doUseToken;
        }).map(token => JSON.stringify(token));
    }
}

module.exports.BuildLexer  = BuildLexer;
module.exports.SourceLexer = SourceLexer;
