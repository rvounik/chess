
// helpers
import Helpers from './../../helpers/index.js';

export default class Knight {
    static getMoves = (map, side, position, pieceId, pieces) => {
        const moves = [];
        const x = position.x;
        const y = position.y;

        // up-right
        if (y > 1 && x < 7) {
            const newFieldId = map[y - 2][x + 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ pieceId: pieceId, x: x + 1, y: y - 2, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }
            } else {
                moves.push({ pieceId: pieceId, x: x + 1, y: y - 2, value: 0 });
            }
        }

        // up-left
        if (y > 1 && x > 0) {
            const newFieldId = map[y - 2][x - 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ pieceId: pieceId, x: x - 1, y: y - 2, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }
            } else {
                moves.push({ pieceId: pieceId, x: x - 1, y: y - 2, value: 0 });
            }
        }

        // down-right
        if (y < 6 && x < 7) {
            const newFieldId = map[y + 2][x + 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ pieceId: pieceId, x: x + 1, y: y + 2, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }
            } else {
                moves.push({ pieceId: pieceId, x: x + 1, y: y + 2, value: 0 });
            }
        }

        // down-left
        if (y < 6 && x > 0) {
            const newFieldId = map[y + 2][x - 1];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ pieceId: pieceId, x: x - 1, y: y + 2, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }
            } else {
                moves.push({ pieceId: pieceId, x: x - 1, y: y + 2, value: 0 });
            }
        }

        return moves;
    }
}
