
// helpers
import Helpers from './helpers/index.js';

// constants
import PieceTypes from './constants/PieceTypes.js';
import PieceValues from './constants/PieceValues.js';
import Sides from './constants/Sides.js';
import PiecesSetup from './constants/PiecesSetup.js';
import BoardSetup from './constants/BoardSetup.js';
import SimplifiedSetup from './constants/SimplifiedSetup.js';

// components
import Pieces from './components/pieces/index.js'

// globals
const context = document.getElementById('canvas').getContext('2d');
const state = {
    turn: Sides.WHITE, // whose turn is it?
    computerSide: Sides.WHITE, // what color does computer play with?
    demo: true, // computer plays both sides?
    bestMove: {
        piece: null,
        score: 0,
        move: null,
        netScore: 0
    },
    scores: {
        'white': 0,
        'black': 0
    },
    status: 'game',
    endTimer: 0,
    initialMapData: BoardSetup,
    initialPiecesConfig: PiecesSetup,
    debug: false,
    rounds: 10, // how many rounds to play in testing phase (player + opponent move is 1 round)
    depthCounter: 100 // how many levels deep should each move in the round be tested
};

let pieces = Helpers.Utils.nestedCopy(state.initialPiecesConfig);
let mapData = Helpers.Utils.nestedCopy(state.initialMapData);

const drawMapDataAsCheckerBoard = map => {
    context.strokeStyle = '#000000';
    context.lineWidth = '1';
    let c = 0;

    for (let a = 0; a < map.length; a++) {
        for (let b = 0; b < map[a].length; b++) {
            c++;
            context.fillStyle = (c + a) % 2 ? '#999999' : '#ffffff';
            context.fillRect(b * 100, a * 100, 100, 100);
            if (map[a][b] !== 0) {
                drawPiece(map[a][b], [b, a]); // in order to visually represent the array grid, reverse the coordinates
            }
            context.font = "20px Arial";
            context.fillStyle = '#dddddd';
            context.fillText(`${a}, ${b}`, b * 100 + 3, a * 100 + 20);
        }
    }
}

const drawPiece = (pieceId, coordinates) => {
    const pieceConfig = Helpers.Pieces.getPieceConfig(pieceId, pieces);

    if (!pieceConfig) {
        console.log('cant find piece with id ', pieceId)
    }

    context.save();
    context.translate(coordinates[0] * 100, coordinates[1] * 100);
    context.translate(20,80);
    context.font = "100px Monospace";
    context.fillStyle = pieceConfig.side === Sides.WHITE ? '#863F0B' : '#000000';
    context.fillText(Helpers.Pieces.getPieceSymbol(pieceConfig.type), 0, 0);
    context.restore();
}

/**
 * updateMapWithMoveForSide
 * iterates over pieces belonging to given side and fetch all possible moves and their values
 * @param {Array} givenMap - the map on which to play the move
 * @param {Object} move - the move to make
 * @param {string} side - the side for which move should be played
 * @param {array} pieces - the pieces
 * @param {boolean} test - run in test mode (dont run side effects)
 * @returns {array} - the best move for each owned piece
 * */
const updateMapWithMoveForSide = (givenMap, move, side, pieces, test) => {

    // make a copy of map and return it, updated
    // const map = Object.assign([], givenMap);
    const oldMap = Helpers.Utils.nestedCopy(givenMap);
    let map = Helpers.Utils.nestedCopy(givenMap);
    const newPos = {};
    const oldPos = {};
    const piece = pieces.filter(pieceConfig => pieceConfig.id === move.pieceId)[0];
    let gameEnd = false;

    for (let a = 0; a < map.length; a++) {
        for (let b = 0; b < map[a].length; b++) {
            if (map[a][b] !== 0) {
                const pieceId = map[a][b];

                // clear old pos
                if (pieceId === move.pieceId) {
                    oldPos.x = a;
                    oldPos.y = b;
                    map[a][b] = 0;
                }
            }

            // find new pos
            if (b === move.x && a === move.y) {
                newPos.x = a;
                newPos.y = b;

                // instead of getting the value from the move, which could be anything, find the piece currently
                // at the new position and get its value to add to the score of the playing side
                if (!test && map[a][b] !== 0) {
                    const capturedPieceId = map[a][b];
                    const capturedPiece = pieces.filter(pieceConfig => pieceConfig.id === capturedPieceId)[0];
                    state.scores[side] += capturedPiece.value;

                    if (state.debug) {
                        console.log(side, piece.type, 'captured', capturedPiece.side, capturedPiece.type, 'for', capturedPiece.value, 'points');
                    }

                    if (!test && capturedPiece.type === PieceTypes.KING) {
                        // if (state.debug) {
                        console.log('king captured, game ended',state.scores);
                        gameEnd=true;
                        // }

                        state.status = 'end';
                    }
                }

                // set the piece at the new pos
                map[a][b] = move.pieceId;
            }
        }
    }

    if (!test) {

        // turn pawn into queen if applicable
        if (piece.type === PieceTypes.PAWN && (newPos.x === 0 || newPos.x === 7)) {
            if (state.debug) {
                console.log('transform pawn into queen');
            }
            piece.type = PieceTypes.QUEEN;
            piece.value = PieceValues.QUEEN;
        }

        if (state.status === 'game') {
            if (state.debug) {
                console.log(side, 'moved', piece.type, 'from', oldPos, 'to', newPos, 'for:',move.netScore);
            }
        }
    }

    if (gameEnd) {
        map = oldMap; // its nice to show the winning move, so revert to old map
    }

    return map;
}

const getOppositeSideId = side => {
    return side === Sides.BLACK ? Sides.WHITE : Sides.BLACK;
}

const switchTurn = () => {
    state.turn = getOppositeSideId(state.turn);
}

// todo: bring back checkmate check if the depth logic wont solve that already
// check if on given map, the king of given side is checkmate at given position
// this function doesnt care if king landed on another piece, or about value etc.
// const checkMate = (map, side, move) => {
//
//     const newMap = updateMapWithMoveForSide(map, move, side, pieces, false);
//
//     // now get the opponent move for this map and see if its going to capture the king, then we know it was checkmate and this move becomes invalid (return true)
//     const bestMoveForOpponent = getBestMovesForEachPiece(mapData, getOppositeSideId(state.turn), false);
//     const bm = Helpers.Utils.shuffle(bestMoveForOpponent);
//
//     if (bm && bm.length && bm[0].value === PieceValues.KING) {
//         console.log('opponent can capture king, consider this checkmate. move is invalid');
//
//         return true;
//     }
//
//     return false;
// }

const getPieceMoves = (piece, map, side, position, pieceId, pieces) => {
    let moves = [];

    switch(piece.type) {
        case PieceTypes.PAWN:
            moves = Pieces.Pawn.getMoves(map, side, position, pieceId, pieces);
            break;
        case PieceTypes.ROOK:
            moves = Pieces.Rook.getMoves(map, side, position, pieceId, pieces);
            break;
        case PieceTypes.KING:
            moves = Pieces.King.getMoves(map, side, position, pieceId, pieces);
            break;
        case PieceTypes.QUEEN:
            moves = Pieces.Queen.getMoves(map, side, position, pieceId, pieces);
            break;
        case PieceTypes.BISHOP:
            moves = Pieces.Bishop.getMoves(map, side, position, pieceId, pieces);
            break;
        case PieceTypes.KNIGHT:
            moves = Pieces.Knight.getMoves(map, side, position, pieceId, pieces);
            break;
        default:
            break;
    }

    // randomise array so we dont see the same moves being repeated todo: redundant once depth comes into play
    moves = Helpers.Utils.shuffle(moves);

    return moves;
};

// todo: getTotalScore or getProbableScore or getAssertedScore or getPredictedScore or getAmendedScore.. all much better
const getNetScore = (move, side, map, obj) => {
    let copyOfMap = Helpers.Utils.nestedCopy(map);
    let score = 0;
    let round = state.rounds; // see the net score after x moves
    let copyOfMove = Object.assign({} , move);
    let localSide = side;

    while (round > 0) {
        const playerMove = move || getBestMove(copyOfMap, localSide, obj);
        copyOfMap = updateMapWithMoveForSide(copyOfMap, playerMove, localSide, pieces, true);
        score += playerMove.value ? playerMove.value : 0;
        copyOfMove = null; // reset original moves: from now on calculate new ones

        if (state.debug) {
            console.log('[', round, ']', localSide, 'move: (', obj.id, ') :');
            console.log(copyOfMap);
        }

        localSide = getOppositeSideId(localSide);

        const opponentMove = getBestMove(copyOfMap, localSide, obj);
        copyOfMap = updateMapWithMoveForSide(copyOfMap, opponentMove, localSide, pieces, true);
        score -= opponentMove.value ? opponentMove.value : 0;
        copyOfMove = null; // just to be sure, null it again

        if (state.debug) {
            console.log('[', round, ']', localSide, 'move: (', obj.id, ') :');
            console.log(copyOfMap);
        }

        localSide = getOppositeSideId(localSide);

        round--;
    }

    if (state.debug) {
        console.log('done with round, score for this one was: ', score);
    }

    return score;
}

const getUniqueRoundId = () => {
    const uniqueRoundSetId = parseInt(Math.random() * 100000000);

    const uniqueRoundSetObj = {
        id: uniqueRoundSetId, // we dont really need an id.. its not used anywhere.
        iteration: 1
    }

    return uniqueRoundSetObj;
}

/**
 * getBestMovesForEachPiece
 * iterates over pieces belonging to given side and fetch all possible moves and their values
 * @param {Array} map - the current state of the chessboard
 * @param {string} side - the side for which moves should be returned
 * @param {Object} obj - unique bla bla
 * @returns {array} - the best move for each owned piece
 * */
const getBestMovesForEachPiece = (map, side, obj) => {
    let bestMovesPerPiece = [];

    // loop over each piece in given map
    for (let a = 0; a < map.length; a++) {
        for (let b = 0; b < map[a].length; b++) {

            // check if it contains a piece
            if (map[a][b] !== 0) {
                const pieceId = map[a][b];
                const piece = pieces.filter(pieceConfig => pieceConfig.id === pieceId)[0];

                // check if it belongs to given side
                if (piece.side === side) {

                    // get all possible moves for this piece (single level)
                    const moves = getPieceMoves(piece, map, side, { x: b, y: a }, pieceId, pieces);

                    moves.forEach(m => {
                        let obje = obj || getUniqueRoundId();

                        obje.iteration++;

                        if (obje.iteration < state.depthCounter) {

                            // pass on the unique round identifier
                            m.netScore = getNetScore(m, side, map, obje) || 0;
                        }
                    });

                    // without doing anything else yet, push the one with the highest value to the array
                    const bestMoveForThisPiece = obj
                        ? Helpers.Utils.getHighestValueObject(moves)
                        : Helpers.Utils.getHighestValueObject(moves, 'netScore');

                    // if the move exists (since pieces can be obstructed) add it to moves array
                    if (Object.keys(bestMoveForThisPiece).length) {
                        bestMovesPerPiece.push(bestMoveForThisPiece);
                    }
                }
            }
        }
    }

    bestMovesPerPiece = Helpers.Utils.shuffle(bestMovesPerPiece);

    return bestMovesPerPiece;
}

/**
 * getBestMove
 * fetches collection of moves per piece, then returns the one with the highest net value
 * @param {Array} map - the current state of the chessboard
 * @param {string} side - the side for which moves should be returned
 * @param {Object} obj - unique id and iteration
 * @returns {Object} - the best move possible given the conditions
 * */
const getBestMove = (map, side, obj = null) => {
    const moves = getBestMovesForEachPiece(map, side, obj);

    return Helpers.Utils.getHighestValueObject(moves, 'netScore');
}

const moveComputerPiece = () => {
    const move = getBestMove(mapData, state.turn);

    if (!Object.keys(move).length) {
        console.log('cant do any move, checkmate?')
        return state.status = 'end';
    }

    mapData = updateMapWithMoveForSide(mapData, move, state.turn, pieces, false);

    switchTurn();
}

/**
 * Perform all timely actions
 */
const update = () => {
    Helpers.Canvas.clearCanvas(context, '#ffffff');
    drawMapDataAsCheckerBoard(mapData);

    if (state.status === 'end') {
        state.endTimer ++;

        if (state.endTimer > 250) {

            // reset scores
            state.scores = {
                'black': 0,
                'white': 0
            }

            // reset pieces (pawns turned into queens) and map
            pieces = Helpers.Utils.nestedCopy(state.initialPiecesConfig);
            mapData = Helpers.Utils.nestedCopy(state.initialMapData);

            // small pause before restarting
            if (state.endTimer > 250) {
                state.endTimer = 0;
                state.status = 'game';
            }
        }
    } else {
        if (state.turn === state.computerSide || state.demo) {
            moveComputerPiece();
        }
    }

    requestAnimationFrame(() => {
        update();
    });
};

// call the updater
update();
