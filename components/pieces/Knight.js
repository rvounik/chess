
// helpers
import Helpers from './../../helpers/index.js';

export default class Knight {
    static getMoves = (map, side, position, pieceId, pieces) => {
        const moves = [];
        const x = position.x;
        const y = position.y;

        // 2up, 1right
        if (y > 1 && x < 7) {
            const newFieldId = map[y - 2][x + 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x + 1, y: y - 2, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x + 1, y: y - 2, value: 0 });
            }
        }

        // 2up,1left
        if (y > 1 && x > 0) {
            const newFieldId = map[y - 2][x - 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x - 1, y: y - 2, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x - 1, y: y - 2, value: 0 });
            }
        }

        // 2down,1right
        if (y < 6 && x < 7) {
            const newFieldId = map[y + 2][x + 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x + 1, y: y + 2, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x + 1, y: y + 2, value: 0 });
            }
        }

        // 2down,1left
        if (y < 6 && x > 0) {
            const newFieldId = map[y + 2][x - 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x - 1, y: y + 2, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x - 1, y: y + 2, value: 0 });
            }
        }

        // 1up,2left
        if (y > 0 && x > 1) {
            const newFieldId = map[y - 1][x - 2];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x - 2, y: y - 1, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x - 2, y: y - 1, value: 0 });
            }
        }

        // 1up,2right
        if (y > 0 && x < 6) {
            const newFieldId = map[y - 1][x + 2];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x + 2, y: y - 1, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x + 2, y: y - 1, value: 0 });
            }
        }

        // 1down,2right
        if (y < 7 && x < 6) {
            const newFieldId = map[y + 1][x + 2];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x + 2, y: y + 1, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x + 2, y: y + 1, value: 0 });
            }
        }

        // 1down,2left
        if (y < 7 && x > 1) {
            const newFieldId = map[y + 1][x - 2];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ side, pieceId: pieceId, x: x - 2, y: y + 1, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }
            } else {
                moves.push({ side, pieceId: pieceId, x: x - 2, y: y + 1, value: 0 });
            }
        }

        return moves;
    }
}
