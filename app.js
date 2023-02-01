
// helpers
import Helpers from './helpers/index.js';

// constants
import PieceTypes from './constants/PieceTypes.js';
import PieceValues from './constants/PieceValues.js';
import Sides from './constants/Sides.js';
import PiecesSetup from './constants/PiecesSetup.js';
import BoardSetup from './constants/BoardSetup.js';
import SimplifiedSetup from './constants/SimplifiedSetup.js';
import GameStates from './constants/GameStates.js';

// components
import Pieces from './components/pieces/index.js'

// globals
const context = document.getElementById('canvas').getContext('2d');
const state = {
    side: Sides.WHITE, // whose turn is it?
    computerSide: Sides.WHITE, // what color does computer play with?
    demo: true, // computer plays both sides?
    bestMove: {
        piece: null,
        score: 0,
        move: null,
        netScore: 0
    },
    scores: {
        [Sides.WHITE]: 0,
        [Sides.BLACK]: 0
    },
    status: GameStates.TITLE,
    endTimer: 0,
    startMap: BoardSetup,
    startPieces: PiecesSetup,
    debug: true,
    debugEachRound: true,
    map: null,
    pieces: null,
    roundsPlayed: 0
};

const drawMapDataAsCheckerBoard = map => {
    context.strokeStyle = '#000000';
    context.lineWidth = '1';
    let c = 0;

    for (let a = 0; a < map.length; a ++) {
        for (let b = 0; b < map[a].length; b ++) {
            c ++;
            context.fillStyle = (c + a) % 2 ? '#999999' : '#ffffff';
            context.fillRect(b * 100, a * 100, 100, 100);
            if (map[a][b] !== 0) {
                drawPiece(map[a][b], [b, a]); // in order to visually represent the array grid, reverse the coordinates
            }
            context.font = "20px Arial";
            context.fillStyle = '#dddddd';
            context.fillText(`${b}, ${a}`, b * 100 + 3, a * 100 + 20);
        }
    }
}

const drawPiece = (pieceId, coordinates) => {
    const pieceConfig = Helpers.Pieces.getPieceConfig(pieceId, state.pieces);

    if (!pieceConfig) {
        throw new Error(`Error: cant find piece with id ${pieceId}`);
    }

    context.save();
    context.translate(coordinates[0] * 100, coordinates[1] * 100);
    context.translate(20, 80);
    context.font = "100px Monospace";
    context.fillStyle = pieceConfig.side === Sides.WHITE ? '#863F0B' : '#000000';
    context.fillText(Helpers.Pieces.getPieceSymbol(pieceConfig.type), 0, 0);
    context.restore();
}

const getOppositeSideId = side => {
    return side === Sides.BLACK ? Sides.WHITE : Sides.BLACK;
}

const switchTurn = () => {
    state.side = getOppositeSideId(state.side);
}

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

    return moves;
};

// updates given pieces for when the given move is played out on given map (capture or transformation)
const getPiecesForMove = (map, move, pieces) => {
    const newPieces = [];
    const givenPieces = Helpers.Utils.nestedCopy(pieces);

    const affectedPieceId = map[move.y][move.x];

    givenPieces.forEach(piece => {
        if (!affectedPieceId || affectedPieceId !== piece.id) {
            newPieces.push(piece)
        }
    });

    return newPieces;
}

// returns score for the given move made on given map for given pieces
const getScoreForMove = (map, move, pieces, side) => {
    const newFieldId = map[move.y][move.x];

    // todo: add check/mate check and increment/decrement the score accordingly
    return newFieldId !== 0 ? Helpers.Pieces.getPieceConfig(newFieldId, pieces).value : 0;

    if (newFieldId !== 0 && Helpers.Pieces.getPieceConfig(newFieldId, pieces).side === side) {
        return Helpers.Pieces.getPieceConfig(newFieldId, pieces).value;
    }
    if (newFieldId !== 0 && Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
        return 0 - Helpers.Pieces.getPieceConfig(newFieldId, pieces).value;
    }
    return 0;
}

// returns updated map for the given move
const getMapForMove = (map, move) => {
    const updatedMap = Helpers.Utils.nestedCopy(map);

    if (!move) {
        throw new Error('Error: invalid move provided');
    }

    // wipe the old position
    for (let a = 0; a < updatedMap.length; a ++) {
        for (let b = 0; b < updatedMap[a].length; b ++) {
            if (updatedMap[a][b] !== 0 && updatedMap[a][b] === move.pieceId) {
                updatedMap[a][b] = 0;
            }
        }
    }

    // put piece at new position
    updatedMap[move.y][move.x] = move.pieceId;

    return updatedMap;
}

const getValidMoves = (side, map, pieces) => {
    const validMoves = [];

    for (let a = 0; a < map.length; a ++) {
        for (let b = 0; b < map[a].length; b ++) {
            if (map[a][b] !== 0) {
                const pieceId = map[a][b];
                const piece = pieces.filter(pieceConfig => pieceConfig.id === pieceId)[0];

                if (piece.side === side) {
                    validMoves.push(...getPieceMoves(piece, map, side, { x: b, y: a }, pieceId, pieces));
                }
            }
        }
    }

    return validMoves;
}

const getMax = (arr, field) => {
    return arr.reduce(function(prev, current) {
        return (prev[field] > current[field]) ? prev : current
    })
}

const getBestMove = (side, map, pieces) => {
    let movesAndResponses = [];

    // get the playing side moves
    const validMoves = getValidMoves(side, map, pieces);

    // now iterate over the moves and amend them with the entities
    validMoves.forEach(move => {
        const nextMap = getMapForMove(map, move);
        const nextPieces = getPiecesForMove(map, move, pieces);

        // lets calculate one level deep of responses (opponent moves)
        const nextResponses = getValidMoves(getOppositeSideId(move.side), nextMap, nextPieces);
        const responses1 = [];

        nextResponses.forEach(response => {
            let r1map = getMapForMove(nextMap, response);
            let r1pieces = getPiecesForMove(nextMap, response, nextPieces);

            // amend each response with updated assets to pass on to deeper levels
            responses1.push({
                pieceId: response.pieceId,
                x: response.x,
                y: response.y,
                score: response.value,
                totalScore: move.value - response.value,
                side: getOppositeSideId(side),
                map: r1map,
                pieces: r1pieces,
                responses: []
            })
        });

        // amend each move with updated assets to pass on to deeper levels
        movesAndResponses.push({
            pieceId: move.pieceId,
            x: move.x,
            y: move.y,
            score: move.value,
            totalScore: move.value,
            side: side,
            map: nextMap,
            pieces: nextPieces,
            responses: responses1
        });
    });

    // todo: this is required since we dont go deep enough. later this can be removed:
    // movesAndResponses = Helpers.Utils.shuffle(movesAndResponses);

    // (for now assume we go just one level deep. later figure out how to go (n) depth levels deep dynamically)
    movesAndResponses.forEach(move => {

        // assume the opponent makes the best possible move, therefore extract the highest response from the move score
        move.netScore = move.score - getMax(move.responses,'score').score;
    });

    return getMax(movesAndResponses, 'netScore')
}

const moveComputerPiece = () => {
    const move = getBestMove(state.side, state.map, state.pieces);

    // update map
    state.map = getMapForMove(state.map, move);

    if (state.debugEachRound) {
        state.status = GameStates.PAUSE;
        console.log( state.side,'wants to play',move);
    }

    state.roundsPlayed ++;

    switchTurn();
}

/**
 * Perform all timely actions
 */
const update = () => {
    if (state.status === GameStates.TITLE) {

        // todo: show some title/start screen here

        if (state.demo) {
            state.map = Helpers.Utils.nestedCopy(state.startMap);
            state.pieces = Helpers.Utils.nestedCopy(state.startPieces)
            state.status = GameStates.GAME;
            state.turn = state.computerSide;
        }
    }

    if (state.status === GameStates.GAME) {
        drawMapDataAsCheckerBoard(state.map);

        if (state.turn === state.computerSide || state.demo) {
            moveComputerPiece();
        }
    }

    if (state.status === GameStates.PAUSE) {

    }

    if (state.status === GameStates.END) {
        state.endTimer ++;

        if (state.endTimer > 10000000) {

            // reset scores
            state.scores = {
                [Sides.BLACK]: 0,
                [Sides.WHITE]: 0
            }

            // reset pieces (because pawns that turned into queens) and map
            state.pieces = Helpers.Utils.nestedCopy(state.startPieces);

            // reset map
            state.map = Helpers.Utils.nestedCopy(state.startMap);

            // small pause before restarting
            if (state.endTimer > 250) {
                state.endTimer = 0;
                state.roundsPlayed = 0;
                state.status = GameStates.TITLE;
            }
        }
    }

    requestAnimationFrame(() => {
        update();
    });
};

// call the updater once
update();

document.querySelector('#nextButton').addEventListener("click", () => {
    state.status = GameStates.GAME;
}, false);
