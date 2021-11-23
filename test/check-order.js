
window = {
    loadedBooks: []
};


// print process.argv
if ( process.argv.length !== 3 ) {
    console.log(`Usage: ${process.argv[0]} ${process.argv[1]} <file to check>`);
    process.exit(1);
}

const moduleName = process.argv[2];

//require('../fi/data/pieni.js');
require(moduleName);




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

