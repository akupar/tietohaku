
window = {
    loadedBooks: []
};

require('../fi/data/pieni.fixed.orig.bak');

function normalizeQuery(e) {
    e = e.toUpperCase(e);

    e = e.replace(/Æ/g, "AE");
    e = e.replace(/Ø/g, "OE");
    e = e.replace(/É/g, "E");
    e = e.replace(/Č/g, "C");
    e = e.replace(/Š/g, "S");
    e = e.replace(/Ž/g, "Z");
    e = e.replace(/Ü/g, "Y");
    e = e.replace(/W/g, "V");
    e = e.replace(/Á/g, "A");
    e = e.replace(/À/g, "A");
    e = e.replace(/Â/g, "A");        
    e = e.replace(/Ó/g, "O");
    e = e.replace(/Ò/g, "O");    
    e = e.replace(/È/g, "E");
    e = e.replace(/É/g, "E");        

    e = e.replace(/[^A-ZÅÄÖ0-9]/g, "");
    e = e.replace(/Å/g, "a");
    e = e.replace(/Ä/g, "b");
    e = e.replace(/Ö/g, "c");
    
    return e;
}

function normalize(e) {
    if ( !e ) {
        return e;
    }
    e = e.toUpperCase(e);

    e = e.replace(/Æ/g, "Ä");
    e = e.replace(/Ø/g, "Ö");
    e = e.replace(/É/g, "E");
    e = e.replace(/Č/g, "C");
    e = e.replace(/Š/g, "S");
    e = e.replace(/Ž/g, "Z");
    e = e.replace(/Ü/g, "Y");
    e = e.replace(/W/g, "V");
    e = e.replace(/Á/g, "A");

    e = e.replace(/[^A-ZÅÄÖ0-9]/g, "");
    
    return e;
}


function split(name, nextName) {

    var eka = name.substr(0, 1);

    var index = name.indexOf("#");
    if ( index !== -1 ) {
        return name.split("#");
    }
    
    const parts = name.split("-");

    if ( parts.length === 1 ) {
        return [ parts[0], "" ];
    }

    const partsWIndex = parts.map((part, index) => ({ index, text: part }));

    const sorted = partsWIndex.sort((a, b) => normalize(a.text).localeCompare(normalize(b.text)));

    const partsWIndexPNext = [ ... partsWIndex, { index: -1, text: nextName } ];
    
    const sortedPNext = partsWIndexPNext.sort((a, b) => normalize(a.text).localeCompare(normalize(b.text)));    


    const start = sorted.findIndex(item => item.index === 0);

    const next = sorted[start + 1];

    const nextEntry = sortedPNext.findIndex(item => item.index === -1);

    console.log("// sorted:", JSON.stringify(sortedPNext));

    //console.log("nextEntry:", nextEntry, start + 1);
    if ( nextEntry <= start + 1 ) {
        console.log("// H ALKU:", name, "LOPPU:", "");
        //console.log("  sorted:", JSON.stringify(sortedPNext));
        return [ name, "" ];
    }
    
    
    //console.assert(next, "EI SEURAAVAA: " + name);

    if ( !next ) {
        console.log("// F ALKU:", name, "LOPPU:", "");
        return [ "#", name, "" ];
    }

    const rightIndex = next.index;
    
    const alku = parts.slice(0, rightIndex).join("-");
    const loppu = parts.slice(rightIndex).join("-");

    console.log("// O ALKU:", alku, "LOPPU:", loppu);
    return [ alku, loppu ];
}


for ( var book of window.loadedBooks ) {
    console.log("/* Book:", book.title, "*/");
    
    for ( var part of book.parts ) {

        if ( part.title !== "Pääosa" ) {
            break;
        }
        
        console.log("  /* Part:", part.title, "*/");

        let prev = null;
        for ( let i in part.pages ) {
            let page = part.pages[i];
            var name = page[1];


            if ( prev ) {
                const [ alku, loppu ] = split(prev, name);
                
                //var line = [ normalizeQuery(alku), alku, normalizeQuery(loppu), loppu, page[2] ];
                var line = [ normalizeQuery(alku), alku, page[2] ];

                console.log(JSON.stringify(line) + ",");
            }
            prev = name;
        }
    }

}

