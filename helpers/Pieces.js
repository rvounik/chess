import PieceTypes from '../constants/PieceTypes.js';
import PieceSymbols from '../constants/PieceSymbols.js';

export default class Pieces {
    static getPieceConfig(id, pieces) {

        // todo: I forgot the .filter alternative.. was it .some? replace everywhere in the code
        return pieces.filter(piece => piece.id === id)[0];
    }

    static getPieceSymbol = type => {
        switch (type) {
            case PieceTypes.KING:
                return PieceSymbols.KING;
            case PieceTypes.QUEEN:
                return PieceSymbols.QUEEN;
            case PieceTypes.ROOK:
                return PieceSymbols.ROOK;
            case PieceTypes.BISHOP:
                return PieceSymbols.BISHOP;
            case PieceTypes.KNIGHT:
                return PieceSymbols.KNIGHT;
            case PieceTypes.PAWN:
                return PieceSymbols.PAWN;
            default:
                return;
        }
    }
}
