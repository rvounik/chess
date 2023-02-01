
// helpers
import Helpers from './../../helpers/index.js';

export default class King {
    static getMoves(map, side, position, pieceId, pieces) {
        const moves = [];
        const x = position.x;
        const y = position.y;

        // move down
        if (y < 7) {
            const newFieldId = map[y + 1][x];

            if (newFieldId !== 0) {
                // only add the move when the piece there is not from your side!
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x, y: y + 1, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value});
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x, y: y + 1, value: 0 });
            }
        }

        // move down-right
        if (y < 7 && x < 7) {
            const newFieldId = map[y + 1][x + 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x + 1, y: y + 1, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value});
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x + 1, y: y + 1, value: 0 });
            }
        }

        // move down-left
        if (y < 7 && x > 0) {
            const newFieldId = map[y + 1][x - 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x - 1, y: y + 1, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value});
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x - 1, y: y + 1, value: 0 });
            }
        }

        // move up
        if (y > 0) {
            const newFieldId = map[y - 1][x];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x, y: y - 1, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value});
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x, y: y - 1, value: 0 });
            }
        }

        // move up-right
        if (y > 0 && x < 7) {
            const newFieldId = map[y - 1][x + 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x + 1, y: y - 1, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value});
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x + 1, y: y - 1, value: 0 });
            }
        }

        // move up-left
        if (y > 0 && x > 0) {
            const newFieldId = map[y - 1][x - 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x - 1, y: y - 1, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value});
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x - 1, y: y - 1, value: 0 });
            }
        }

        // move right
        if (x < 7) {
            const newFieldId = map[y][x + 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x + 1, y: y, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value});
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x + 1, y: y, value: 0 });
            }
        }

        // move left
        if (x > 0) {
            const newFieldId = map[y][x - 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x - 1, y: y, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value});
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x - 1, y: y, value: 0 });
            }
        }

        return moves;
    }
}
