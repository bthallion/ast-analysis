'use strict';

const ndarray = require('ndarray');
const originEnum = {
    TOP: 1,
    LEFT: 2,
    DIAGONAL: 4
};
// Flat gap penalty, currently doesn't scale with gap size
const gapPenalty = 2;
const similarityScore = 5;
const originMap = new Map();

// Implementation of the Smith-Waterman algorithm
// https://en.wikipedia.org/wiki/Smith%E2%80%93Waterman_algorithm#cite_note-Gotoh1982-2
const getOptimalLocalAlignment = (opts) => {
    const { seqA, seqB } = opts;
    const matrix = getMatrix(seqA.length + 1, seqB.length + 1);

    const getCellScore = (x, y) => {
        const aElement = seqA[x - 1];
        const bElement = seqB[y - 1];
        const doMatch = aElement === bElement;
        const diagCell = matrix.get(x - 1, y - 1);
        const diagScore = diagCell + (doMatch ? similarityScore : -similarityScore);
        const leftCell = matrix.get(x - 1, y);
        const topCell  = matrix.get(x, y - 1);
        const leftScore = leftCell - gapPenalty;
        const topScore = topCell - gapPenalty;

        if (diagScore === 0 && leftScore === 0 && topScore === 0) {
            // We'll terminate any alignments that run through this cell
            // so we don't need to store its origin
            return 0;
        }

        const key = x + ', ' + y;
        let origin;
        const greatestCell = Math.max(diagCell, leftCell, topCell);
        const notDiag = diagScore < leftScore || diagScore < topScore;
        const notTop = topScore < leftScore || topScore < diagScore;
        const areScoresEqual = diagScore === leftScore && leftScore === topScore;

        // This...is ugly
        if (areScoresEqual) {
            if (leftCell === greatestCell) {
                origin = originEnum.LEFT;
            }
            else if (topCell === greatestCell) {
                origin = originEnum.TOP;
            }
            else {
                origin = originEnum.DIAGONAL;
            }
        }
        else if (notDiag) {
            if (leftScore === topScore) {
                origin = leftCell > topCell ? originEnum.LEFT : originEnum.TOP;
            }
            else {
                origin = leftScore > topScore ? originEnum.LEFT : originEnum.TOP;
            }
        }
        else if (notTop) {
            if (diagScore === leftScore) {
                origin = diagCell > leftCell ? originEnum.DIAGONAL : originEnum.LEFT;
            }
            else {
                origin = diagScore > leftScore ? originEnum.DIAGONAL : originEnum.LEFT;
            }
        }
        else {
            if (diagScore === topScore) {
                origin = diagCell > topCell ? originEnum.DIAGONAL : originEnum.TOP;
            }
            else {
                origin = diagScore > topScore ? originEnum.DIAGONAL : originEnum.TOP;
            }
        }

        let score;

        switch (origin) {
            case originEnum.DIAGONAL:
                score = diagScore;
                break;

            case originEnum.TOP:
                score = topScore;
                break;

            case originEnum.LEFT:
                score = leftScore;
                break;
        }

        if (score > 0) {
            originMap.set(key, origin);
            return score;
        }
        return 0;
    };

    const getAlignmentPath = (x, y) => {
        let aElement;
        let bElement;
        let key;
        let origin;
        let pathX = x;
        let pathY = y;
        let cell = matrix.get(x, y);
        const path = [];
        while (cell) {
            key = pathX + ', ' + pathY;
            origin = originMap.get(key);
            switch (origin) {
                case originEnum.LEFT:
                    aElement = seqA[pathX - 1];
                    path.push([aElement, '-']);
                    pathX--;
                    break;
                case originEnum.TOP:
                    bElement = seqB[pathY - 1];
                    path.push(['-', bElement]);
                    pathY--;
                    break;
                case originEnum.DIAGONAL:
                    aElement = seqA[pathX - 1];
                    bElement = seqB[pathY - 1];
                    path.push([aElement, bElement]);
                    pathY--;
                    pathX--;
                    break;
            }
            cell = matrix.get(pathX, pathY);
        }
        return path;
    };

    let cellScore;
    let bestCell = {score: 0, coors:[0,0]};

    for (let y = 1; y < matrix.shape[1]; y++) {
        for (let x = 1; x < matrix.shape[0]; x++) {
            cellScore = getCellScore(x, y);
            if (cellScore > bestCell.score) {
                bestCell.score = cellScore;
                bestCell.coors = [x, y];
            }
            matrix.set(x, y, cellScore);
        }
    }

    return getAlignmentPath(...bestCell.coors);
};

const getMatrix = (n, m) => {
    const array  = new Uint32Array(n * m);
    const matrix = ndarray(array, [n, m]);

    for (let x = 0; x < matrix.shape[0]; x++) {
        matrix.set(x, 0, 0);
    }

    for (let y = 0; y < matrix.shape[1]; y++) {
        matrix.set(0, y, 0);
    }

    return matrix;
};

module.exports.getOptimalLocalAlignment = getOptimalLocalAlignment;
