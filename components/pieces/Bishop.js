
// helpers
import Helpers from './../../helpers/index.js';

export default class Bishop {
    static getMoves(map, side, position, pieceId, pieces) {
        const moves = [];
        const x = position.x;
        const y = position.y;

        let addition = 0;

        // move down-right
        while (y + addition < 7 && x + addition < 7) {
            addition ++;

            const newFieldId = map[y + addition][x + addition];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ pieceId: pieceId, x: x + addition, y: y + addition, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }

                break;
            } else {
                moves.push({ pieceId: pieceId, x: x + addition, y: y + addition, value: 0 });
            }
        }

        // reset for next move
        addition = 0;

        // move down-left
        while (y + addition < 7 && x - addition > 0) {
            addition ++;

            const newFieldId = map[y + addition][x - addition];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ pieceId: pieceId, x: x - addition, y: y + addition, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }

                break;
            } else {
                moves.push({ pieceId: pieceId, x: x - addition, y: y + addition, value: 0 });
            }
        }

        // reset for next move
        addition = 0;

        // move up-right
        while (y - addition > 0 && x + addition < 7) {
            addition ++;

            const newFieldId = map[y - addition][x + addition];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ pieceId: pieceId, x: x + addition, y: y - addition, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }

                break;
            } else {
                moves.push({ pieceId: pieceId, x: x + addition, y: y - addition, value: 0 });
            }
        }

        // reset for next move
        addition = 0;

        // move up-left
        while (y - addition > 0 && x - addition > 0) {
            addition ++;

            const newFieldId = map[y - addition][x - addition];

            if (newFieldId !== 0) {
                if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                    moves.push({ pieceId: pieceId, x: x - addition, y: y - addition, value: Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                }

                break;
            } else {
                moves.push({ pieceId: pieceId, x: x - addition, y: y - addition, value: 0 });
            }
        }

        return moves;
    }
}
