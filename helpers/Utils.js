export default class Utils {

    /**
     * Does a random shuffle on given array
     */
    static shuffle(array) {
        let currentIndex = array.length,  randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex !== 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    static nestedCopy(array) {
        return JSON.parse(JSON.stringify(array));
    }

    static getHighestValueObject(array) {
        let highestValueObject = {};

        array.forEach(move => {
            if (!highestValueObject.value || move.value > highestValueObject.value) {
                highestValueObject = move;
            }
        });

        return highestValueObject;
    }

}
