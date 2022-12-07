
// helpers
import Helpers from './../../helpers/index.js';

export default class Rook {
    static getMoves(map, side, position, pieceId, pieces) {
        const moves = [];
        const x = position.x;
        const y = position.y;

        let addition = 0;

        // move down
        while (y + addition < 7) {
            addition ++;

            const newFieldId = map[y + addition][x];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({pieceId: pieceId, x: x, y: y + addition, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value});
                }

                break;
            } else {
                moves.push({ pieceId: pieceId, x: x, y: y + addition, value: 0 });
            }
        }

        // reset for next direction
        addition = 0;

        // move up
        while (y - addition > 0) {
            addition ++;

            const newFieldId = map[y - addition][x];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({pieceId: pieceId, x: x, y: y - addition, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value});
                }

                break;
            } else {
                moves.push({ pieceId: pieceId, x: x, y: y - addition, value: 0 });
            }
        }

        // reset for next direction
        addition = 0;

        // move right
        while (x + addition < 7) {
            addition ++;

            const newFieldId = map[y][x + addition];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({pieceId: pieceId, x: x + addition, y: y, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value});
                }

                break;
            } else {
                moves.push({ pieceId: pieceId, x: x + addition, y: y, value: 0 });
            }
        }

        // reset for next direction
        addition = 0;

        // move left
        while (x - addition > 0) {
            addition ++;

            const newFieldId = map[y][x - addition];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({pieceId: pieceId, x: x - addition, y: y, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value});
                }

                break;
            } else {
                moves.push({ pieceId: pieceId, x: x - addition, y: y, value: 0 });
            }
        }

        return moves;
    }
}
