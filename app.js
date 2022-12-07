
// helpers
import Helpers from './helpers/index.js';

// constants
import PieceTypes from './constants/PieceTypes.js';
import PieceValues from './constants/PieceValues.js';
import Sides from './constants/Sides.js';
import PiecesSetup from './constants/PiecesSetup.js';
import BoardSetup from './constants/BoardSetup.js';

// components
import Pieces from './components/pieces/index.js'

// globals
const context = document.getElementById('canvas').getContext('2d');
const state = {
    turn: Sides.BLACK, // whose turn is it?
    computerSide: Sides.BLACK, // what color does computer play with?
    demo: true, // computer plays both sides?
    bestMove: {
        piece: null,
        score: 0,
        move: null
    },
    scores: {
        'white': 0,
        'black': 0
    },
    status: 'game',
    endTimer: 0,
    initialMapData: BoardSetup,
    initialPiecesConfig: PiecesSetup,
    depth: 3,
    debug: false
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

const updateMapWithMoveForSide = (givenMap, move, side, pieces) => {

    // make a copy of map and return it, updated
    const map = Object.assign([], givenMap);
    const newPos = {};
    const oldPos = {};
    const piece = pieces.filter(pieceConfig => pieceConfig.id === move.pieceId)[0];

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
                if (map[a][b] !== 0) {
                    const capturedPieceId = map[a][b];
                    const capturedPiece = pieces.filter(pieceConfig => pieceConfig.id === capturedPieceId)[0];
                    state.scores[side] += capturedPiece.value;

                    if (state.debug) {
                        console.log(side, piece.type, 'captured', capturedPiece.side, capturedPiece.type, 'for', capturedPiece.value, 'points');
                    }
                    if (capturedPiece.type === PieceTypes.KING) {
                        if (state.debug) {
                            console.log('king captured, game ended',state.scores);
                        }

                        state.status = 'end';
                    }
                }

                // set the piece at the new pos
                map[a][b] = move.pieceId;
            }
        }
    }

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
            console.log(side, 'moved', piece.type, 'from', oldPos, 'to', newPos);
        }
    }

    return map;
}

const getOppositeSideId = side => {
    return side === Sides.BLACK ? Sides.WHITE : Sides.BLACK;
}

const switchTurn = () => {
    state.turn = getOppositeSideId(state.turn);
}

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

/**
 * getBestMovesForEachPiece
 * iterates over pieces belonging to given side and fetch all possible moves and their values
 * @param {Array} map - the current state of the chessboard
 * @param {string} side - the side for which moves should be returned
 * @returns {array} - the best move for each owned piece
 * */
const getBestMovesForEachPiece = (map, side) => {

    /* ah, yes. now I get it. by definition, 'best moves for each piece' already implies it was tested multiple times
    using my <depth> logic thingie.
     */


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

                    // get all possible moves for this piece
                    const moves = getPieceMoves(piece, map, side, { x: b, y: a }, pieceId, pieces);

                    // moves.forEach(move => {
                    //     let playerMove, oppositeMove;
                    //     let scoreCopy = state.scores[side];
                    //     const mapCopy = Object.assign([], map);
                    //     updateMapWithMoveForSide(mapCopy, move, state.turn, pieces);
                    //     scoreCopy += move.value
                    //     const oppositeMove = getBestMove(mapCopy, getOppositeSideId(side), state.depth--);
                    //     updateMapWithMoveForSide(mapCopy, oppositeMove, getOppositeSideId(side), pieces);
                    //     scoreCopy -= oppositeMove.value;
                    //     const playerMove = getBestMove(mapCopy, getOppositeSideId(side), state.depth--);
                    //     updateMapWithMoveForSide(mapCopy, oppositeMove, getOppositeSideId(side), pieces);
                    //     scoreCopy -= oppositeMove.value;
                    //
                    //
                    //
                    //     if (state.depth > 0) {
                    //         const oppositeMoves = getBestMove(mapCopy, getOppositeSideId(side), state.depth--);
                    //     } else {
                    //         console.log('depth exhausted, we now have the nett score over < depth > moves. add it to move and move on.')
                    //     }
                    // }
                    //

                    // // for each of those moves:
                    // moves.forEach(move => {
                    //
                    //     //make a copy of score:
                    //     let scoreCopy = state.scores[side];
                    //
                    //     // make copy of map: mapCopy:
                    //     const mapCopy = Object.assign([], map);
                    //
                    //     // apply the move to mapCopy:
                    //     updateMapWithMoveForSide(mapCopy, move, state.turn, pieces);
                    //
                    //     // update your score:
                    //     scoreCopy += move.value
                    //
                    //     // call getBestMove for the opposite side with the updated map: getBestMove(mapCopy, getOppositeSideId(side));
                    //     // but... if we dont do something there it will run into infinite loop
                    //     // to fix this we add a parameter that depletes on every call. how? well, call it like this:
                    //     // (and simply reset that to <depth> every time it is your turn again)
                    //     if (state.depth > 0) {
                    //         const oppositeMoves = getBestMove(mapCopy, getOppositeSideId(side), state.depth--);
                    //     } else {
                    //         console.log('depth exhausted, now what? just take the highest valued move?')
                    //     }
                    // });






                    // without doing anything else yet, push the one with the highest value to the array
                    const bestMoveForThisPiece = Helpers.Utils.getHighestValueObject(moves);

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
 * @param {Number} iteration - counter for iteration loop
 * @returns {Object} - the best move possible given the conditions
 * */
const getBestMove = (map, side, iteration ) => {
    const moves = getBestMovesForEachPiece(map, side, true);

    return Helpers.Utils.getHighestValueObject(moves);
}

const moveComputerPiece = () => {
    const move = getBestMove(mapData, state.turn);

    // todo: the below idea looks good, but its not. it should be doing this for EVERY move, not just the best ones.

    // make copy of map eg. copyOfMap
    // make copy of score eg. copyOfScore

    // get the best move for your side eg. getBestMove(copyOfMap, state.turn);
    // do the move on copy of map (confirm the original is untouched!) eg updateMapWithMoveForSide(copyOfMap, move, state.turn, pieces)
    // update your score: copyOfScore += move.value
    // get the move for the opposite side: const opponentMove = getBestMove(copyOfMap, getOppositeTurnId(state.turn))
    // deduct from your score: copyOfScore -= opponentMove.value;
    // do the move on copy of map eg. updateMapWithMoveForSide(copyOfMap, opponentMove, getOppositeTurnId(state.turn), pieces)
    // repeat this block <depth> times


    if (!Object.keys(move).length) {
        console.log('cant do any move, checkmate?')
        return state.status = 'end';
    }

    if (Object.keys(move).length) {
        mapData = updateMapWithMoveForSide(mapData, move, state.turn, pieces);
    }

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

        if (state.endTimer > 100) {

            // reset scores
            state.scores = {
                'black': 0,
                'white': 0
            }

            // reset pieces (pawns turned into queens) and map
            pieces = Helpers.Utils.nestedCopy(state.initialPiecesConfig);
            mapData = Helpers.Utils.nestedCopy(state.initialMapData);

            // small pause before restarting
            if (state.endTimer > 150) {
                state.endTimer = 0;
                state.status = 'game';
            }
        }
    } else {
        if (state.turn === state.computerSide || state.demo) {
            state.depth = 3;
            moveComputerPiece();
        }
    }

    requestAnimationFrame(() => {
        update();
    });
};

// call the updater
update();
