
// helpers
import Helpers from './../../helpers/index.js';
import Sides from '../../constants/Sides.js';

export default class Pawn {
    static getMoves(map, side, position, pieceId, pieces) {
        const moves = [];
        const x = position.x;
        const y = position.y;

        if (side === Sides.BLACK) {

            // move down to empty square
            if (y < 7 && map[y + 1][x] === 0) {

                // value increases when nearing opponents edge and is 50 when next move can turn into queen
                moves.push({ side, pieceId: pieceId, x: x, y: y + 1, value: y === 6 ? 50 : y > 4 ? y : 0 });
            }

            // todo: add double when still at starting y

            // attempt to move down-right to see if there is an opponent piece to capture
            if (y < 7 && x < 7) {
                const newFieldId = map[y + 1][x + 1];

                if (newFieldId !== 0) {
                    if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                        moves.push({ side, pieceId: pieceId, x: x + 1, y: y + 1, value: y === 6 ? 50 + Helpers.Pieces.getPieceConfig(newFieldId, pieces).value : Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                    }
                }
            }

            // attempt to move down-left to see if there is an opponent piece to capture
            if (y < 7 && x > 0) {
                const newFieldId = map[y + 1][x - 1];

                if (newFieldId !== 0) {
                    if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                        moves.push({ side, pieceId: pieceId, x: x - 1, y: y + 1, value: y === 6 ? 50 + Helpers.Pieces.getPieceConfig(newFieldId, pieces).value : Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                    }
                }
            }
        }

        if (side === Sides.WHITE) {

            // move up to empty square
            if (y > 0 && map[y - 1][x] === 0) {

                // value increases when nearing opponents edge and is 50 when next move can turn into queen
                moves.push({ side, pieceId: pieceId, x: x, y: y - 1, value: y === 1 ? 50 : y < 4 ? 7 - y : 0 });
            }

            // todo: add double when still at starting y

            // attempt to move up-right to see if there is an opponent piece to capture
            if (y > 0 && x < 7) {
                const newFieldId = map[y - 1][x + 1];

                if (newFieldId !== 0) {
                    if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                        moves.push({ side, pieceId: pieceId, x: x + 1, y: y - 1, value: y === 1 ? 50 + Helpers.Pieces.getPieceConfig(newFieldId, pieces).value : Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                    }
                }
            }

            // attempt to move up-left to see if there is an opponent piece to capture
            if (y > 0 && x > 0) {
                const newFieldId = map[y - 1][x - 1];

                if (newFieldId !== 0) {
                    if (Helpers.Pieces.getPieceConfig(newFieldId, pieces).side !== side) {
                        moves.push({ side, pieceId: pieceId, x: x - 1, y: y - 1, value: y === 1 ? 50 + Helpers.Pieces.getPieceConfig(newFieldId, pieces).value : Helpers.Pieces.getPieceConfig(newFieldId, pieces).value });
                    }
                }
            }
        }

        return moves;
    }
}
