
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
        'white': 0, // todo: figure out how to use constant here
        'black': 0
    },
    status: GameStates.TITLE,
    endTimer: 0,
    startMap: SimplifiedSetup,
    startPieces: PiecesSetup,
    debug: true,
    rounds: 10, // how many rounds to play in testing phase (player + opponent move is 1 round)
    depth: 1000, // how many levels deep should each move in the round be tested
    depthCounter: 0, // keeping track of depth position
    map: null,
    pieces: null
};

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
    const pieceConfig = Helpers.Pieces.getPieceConfig(pieceId, state.pieces);

    if (!pieceConfig) {
        console.log('cant find piece with id ', pieceId)
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

    // moves = Helpers.Utils.shuffle(moves);

    return moves;
};

// updates given pieces for when the given move is played out on given map (capture or transformation)
const getPiecesForMove = (map, move, pieces) => {
    // const newPieces = [];
    // const givenPieces = Helpers.Utils.nestedCopy(pieces);
    //
    // const affectedPieceId = map[move.y][move.x];
    //
    // if (affectedPieceId) {
    //     givenPieces.forEach(piece => {
    //         if (piece.id !== affectedPieceId) {
    //             newPieces.push(piece)
    //         }
    //     });
    // }
    // am actually not sure if pieces should be mutated. sure, the type of the piece can change but be careful
    // it is only persisted within a single round, not across different moves!
    // for now I play it safe and just return the original pieces
    return pieces;
}

// returns score for the given move made on given map for given pieces
const getScoreForMove = (map, move, pieces) => {
    const newFieldId = map[move.y][move.x];
    return newFieldId !== 0 ? Helpers.Pieces.getPieceConfig(newFieldId, pieces).value : 0;
}

const getMapForMove = (map, move) => {
    const updatedMap = Helpers.Utils.nestedCopy(map);

    if (!move) {
        console.log('Error: invalid move provided');

        return;
    }

    // wipe the old position
    // todo: instead of this expensive lookup, simply store the old x,y in each piece' getMoves method
    for (let a = 0; a < updatedMap.length; a++) {
        for (let b = 0; b < updatedMap[a].length; b++) {
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

    for (let a = 0; a < map.length; a++) {
        for (let b = 0; b < map[a].length; b++) {
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

const getBestMove = (side, map, pieces, simulating = false) => {
   const validMoves = getValidMoves(side, map, pieces);

   if (!simulating) {
       state.depthCounter = state.depth; // set the depth counter once
   }

   state.depthCounter--;

   if (state.depthCounter < 1) {
       return;
   }

    validMoves.forEach(move => {
        let nextMap = Helpers.Utils.nestedCopy(map);
        let nextPieces = Helpers.Utils.nestedCopy(pieces);
        let nextScore = 0;
        let nextMove;
        let nextSide = side;
        let currentRound = 0;
        const maxRounds = state.rounds;

        // handle "own" move first (since it differs a bit from how this is done inside the loop)
        nextMove = move;
        nextScore+= getScoreForMove(nextMap, nextMove, nextPieces);
        nextMap = getMapForMove(nextMap, nextMove);
        nextPieces = getPiecesForMove(nextMap, nextMove, nextPieces);

        while (currentRound < maxRounds) {
            currentRound ++;
            nextSide = getOppositeSideId(nextSide);
            nextMove = getBestMove(nextSide, nextMap, nextPieces, true);

            if (!nextMove) {
                break; // break because exhausted depth
            }

            nextScore += getScoreForMove(nextMap, nextMove, nextPieces);
            nextMap = getMapForMove(nextMap, nextMove);
            nextPieces = getPiecesForMove(nextMap, nextMove, nextPieces);
        }

        if (!simulating) {
            move.totalScore = nextScore;
        }
    });

    if (!simulating) {
        return Helpers.Utils.getHighestValueObject(validMoves, 'totalScore')
    }

    return validMoves[0];
}

const moveComputerPiece = () => {

    const move = getBestMove(state.side, state.map, state.pieces);
    state.map = getMapForMove(state.map, move);

    // todo: check for check/mate?
    // todo: update score somewhere now that the move is actually made

    // end the game for now to study a single move
    state.status = GameStates.END;

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

    if (state.status === GameStates.END) {
        state.endTimer ++;

        if (state.endTimer > 10000000) {

            // reset scores
            state.scores = {
                'black': 0,
                'white': 0
            }

            // reset pieces (because pawns that turned into queens) and map
            state.pieces = Helpers.Utils.nestedCopy(state.startPieces);

            // reset map
            state.map = Helpers.Utils.nestedCopy(state.startMap);

            // small pause before restarting
            if (state.endTimer > 250) {
                state.endTimer = 0;
                state.status = GameStates.TITLE;
            }
        }
    }

    // Helpers.Canvas.clearCanvas(context, '#ffffff');

    requestAnimationFrame(() => {
        update();
    });
};

// call the updater
update();
