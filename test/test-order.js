
window = {
    loadedBooks: []
};

//require('../fi/data/pieni.js');
require('../fi/data/tekasana.js');




for ( var book of window.loadedBooks ) {
    console.log("Book:", book.title);
    
    for ( var part of book.parts ) {
        console.log("  Part:", part.title);

        let prev = null;
        ok = true;
        for ( var page of part.pages ) {
            if ( prev !== null && prev[0] !== null ) {
                console.assert(prev[0] <= page[0], "    Aakkostusvirhe: " + page[1] + " (" + page[0] + ") !> " + prev[1] + " (" + prev[0] + ")");
                if ( prev[0] > page[0] ) {
                    ok = false;
                }
            }
            prev = [ ... page ];
        }
        if ( ok ) {
            console.log("    OK");
        }
    }

}

