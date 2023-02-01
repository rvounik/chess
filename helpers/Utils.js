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


    // make deep copy
    static nestedCopy(array) {
        return JSON.parse(JSON.stringify(array));
    }

    // return obj with the highest value, or given field
    static getHighestValueObject(array, field = null) {
        let highestValueObject = {};

        if (field) {
            array.forEach(move => {
                if (!highestValueObject[field] || move[field] > highestValueObject[field]) {
                    highestValueObject = move;
                }
            });
        } else {
            array.forEach(move => {
                if (!highestValueObject.value || move.value > highestValueObject.value) {
                    highestValueObject = move;
                }
            });
        }

        // if (highestValueObject.netScore) {
        //     console.log('high score is:', highestValueObject.netScore);
        // }

        return highestValueObject;
    }

    // sort by given key
    static sortByKey(array, key) {
        return array.sort(function(a, b) {
            let x = a[key];
            let y = b[key];

            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

}
