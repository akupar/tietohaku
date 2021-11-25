(function(){

    window.loadedBooks = window.loadedBooks || [];

    function clearError() {
        if ( $("#error-message").data('timer') ) {
            clearTimeout($("#error-message").data('timer'));
        }
        $("#error-message").fadeOut();
    }
    function setError(errorMessage) {
        clearError();
        $("#error-message").html(errorMessage);
        $("#error-message").data('timer', setTimeout(clearError, 3000));
        $("#error-message").show();
    }
    
    
    function pageListItemToObject(item) {
        if ( !item ) {
            return null;
        }
        
        return {
            keyword: item[1],
            pages: item.slice(2),
        };
    }

    function binary_search(array, needle) {
        var lo = -1,
            hi = array.length,
            mi;
        
        while (1 + lo < hi) {
            mi = lo + ((hi - lo) >> 1);
            if ( array[mi][0] > needle ) {
                hi = mi;
            } else {
                lo = mi;
            }
        }
        
        return hi;
    }

    function getPages(array, needle, collation) {
        needle = normalizeQuery(needle, collation);
        var next_index = binary_search(array, needle);

        
        var index = next_index;
        do {
            index--;
        } while ( array[index - 1] && array[index - 1][0] === needle );

        return {
            prev: pageListItemToObject(array[index]),
            next: pageListItemToObject(array[next_index])
        };
    }



    function normalizeQuery_fi(e) {
	e = e.toUpperCase(e);

	e = e.replace(/Æ/g, "Ä");
	e = e.replace(/Ø/g, "Ö");
	e = e.replace(/É/g, "E");
	e = e.replace(/Č/g, "C");
	e = e.replace(/Š/g, "S");
	e = e.replace(/Ž/g, "Z");
        e = e.replace(/Ü/g, "Y");
	e = e.replace(/W/g, "V");

	e = e.replace(/[^A-ZÅÄÖ0-9]/g, "");
	e = e.replace(/Å/g, "a");
	e = e.replace(/Ä/g, "b");
	e = e.replace(/Ö/g, "c");
        
	return e;
    }

    function normalizeQuery_fi_s(e) {
	e = e.toUpperCase(e);

	e = e.replace(/Æ/g, "Ä");
	e = e.replace(/Ø/g, "Ö");
	e = e.replace(/É/g, "E");
	e = e.replace(/Č/g, "C");
	e = e.replace(/Ž/g, "Z");
        e = e.replace(/Ü/g, "Y");
	e = e.replace(/W/g, "V");

	e = e.replace(/[^A-ZÅÄÖŠ0-9]/g, "");
	e = e.replace(/Å/g, "a");
	e = e.replace(/Ä/g, "b");
	e = e.replace(/Ö/g, "c");
	e = e.replace(/Š/g, "Sh");

	return e;
    }

    function normalizeQuery_en(e) {
	e = e.toUpperCase(e);
        e = e.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        e = e.replace(/[^A-Z0-9]/g, " ");
        
	return e;
    }    

    function normalizeQuery(e, collation) {
        switch ( collation ) {
            case "fi":
                return normalizeQuery_fi(e);
            case "fi, s > š":
                return normalizeQuery_fi_s(e);
            case "sv":
                return normalizeQuery_fi(e);
            case "en":
                return normalizeQuery_en(e);
            case "la":
                return normalizeQuery_en(e);
        }

        throw new Error("Unknown collation: " + collation);
    }
    
    
    
    
    function makeURL(pref, page) {
        console.assert(pref.endsWith("/"));
        return pref + page + ".html";

    }


    function getResults(hs) {
        var result = [];
        var book = window.loadedBooks[0];
        
        var rbook = {
            title: book.title,
            id: book.id,
            urlpref: book.url,
            parts: []
        };

        for ( var i in book.parts ) {
            var bookPart = book.parts[i];
            var pages = getPages(bookPart.pages, hs, book.collation);
	    var prev = pages.prev;
	    var next = pages.next;

            rbook.parts.push({
                title: bookPart.title,
                id: book.id + '-' + i,
                prev: prev,
                next: next
            })
            
        }
        
	return rbook;
    }

    function loadPage($event) {

        $event.preventDefault();
        var url = $($event.target).attr("href");

        $('iframe').attr('src', url);

        $('#result').hide();
        return false;
    }

    
    function $result_formatPage(keywordEntry, urlpref) {
        var $pageLi = $("<li></li>");
        if ( keywordEntry ) {
            $pageLi.append(keywordEntry.keyword + ": ");

            for ( var page of keywordEntry.pages ) {
                $pageLi.append(
                    $('<a></a>')
                        .attr('target', '_blank')
                        .attr('rel', 'noopener')
                        .attr('href', makeURL(urlpref, page.l))
                        .text(page.s)
                        .click(loadPage)
                );
                
                if ( page !== keywordEntry.pages[keywordEntry.pages.length - 1] ) {
                    $pageLi.append(", ");
                }
            }
        } else {
            $pageLi.append("–");
        }
        
        return $pageLi;
    }

    
    function $result_formatPages(prev, next, urlpref) {
        var $pagesUl = $('<ul></ul>');
        
        $pagesUl.append($result_formatPage(prev, urlpref));
        $pagesUl.append($result_formatPage(next, urlpref));        

        return $pagesUl;

    }
    
    function $result_formatPart(part, urlpref) {
        var $partLi = $("<li></li>").attr('id', part.id);
        
        $partLi.append($("<span></span>").text(part.title));            
        $partLi.append($result_formatPages(part.prev, part.next, urlpref));

        return $partLi;
    }
    

    function $result_formatParts(parts, urlpref) {
        var $partsUl = $('<ul></ul>');
        
        for ( var part of parts ) {
            $partsUl.append($result_formatPart(part, urlpref));
        }

        return $partsUl;

    }

    function $result_formatBook(book) {
        var $bookP = $("<p></p>");
        $bookP.attr('id', book.id);
        
        var $partsUl = $result_formatParts(book.parts, book.urlpref);
        $partsUl.hide();
        $bookP.append($partsUl);

        $partsUl.slideDown();
        
        return $bookP;
    }


    
    function getQuery() {
        var urlSearchParams = new URLSearchParams(window.location.search);
        return Object.fromEntries(urlSearchParams.entries());
    }

    function getCheckedIds() {
        var $cbs = $('input[type="checkbox"]');
        var list = [];
        
        $cbs.each(function () {
            if ( $(this).attr('checked') === true ) {
                list.push($(this).attr('name'));
            }
        });

        return list;
    }

    function getSelectedBooks() {
        var list = getCheckedIds();
        var books = list.filter(function (item) { return item.indexOf("-") === -1; });

        return books;
    }

    function getSelectedParts() {
        var list = getCheckedIds();        
        var books = list.filter(function (item) { return item.indexOf("-") === -1; });

        var map = {};
        for ( var book of books ) {
            map[book] = true;
        }

        var parts = list.filter(function (item) {
            var bookAndPart = item.split("-");
            var book = bookAndPart[0];            
            var part = bookAndPart[1];
            return part !== undefined && map[book];
        });

        return parts;
    }
    
    function removeUndefined(obj) {
        var out = {};
        for ( var key in obj ) {
            if ( obj[key] !== undefined ) {
                out[key] = obj[key];
            }
        }
        return out;
    }


    function loadBook(bookId) {
        var scriptName = "../data/" + bookId + ".js";
        var d = $.Deferred();
        
        var script = document.createElement('script');
        script.onload = function () {
            var book = window.loadedBooks.find(function (book) { return book.id === bookId; });
            book.id = bookId;
            book.title = "Tietosanakirja";

            console.log("LOADED:", book.id);
            d.resolve();
        };
        
        script.src = scriptName;
        document.head.appendChild(script);

        return d;
    }




    function addHistoryItem(state) {
        state = removeUndefined(state);
        
        history.pushState(state, '”' + state.term + '” – Hae Tietosanakirjasta', "?" + $.param(state).replaceAll("%2B", " "));
    }


    function submitQuery($event) {
        console.log("bmit");
        if ( $event ) {
            $event.preventDefault();
        }

	var queryTerm = $("#hakusana").val();
        if ( !queryTerm ) {
            return false;
        }


        $('title').text('”' + queryTerm + '” – Tietosanakirja');
        var bookResult = getResults(queryTerm);

        $('#result').html($result_formatBook(bookResult));
        console.log("result:", bookResult);

        
        $("#result").css('left', $("form label").position()["left"]);
        $('#result').show();
        $('#result').find('a').first().focus();
        
        addHistoryItem({
            term: queryTerm,
            book: window.loadedBook
        });

        return false;
    }

    

    function run() {
        var query = getQuery();

        $("#hakusana").val(query.term || "");
        $("#hakusana").change(function () {
            $('#result').hide();
        });
	$("#lomake").submit(submitQuery);
        $("body").keyup(function ($event) {

            console.log("EV:", $event.key, $event);
            if ( $event.which === 27 ) {
                $('#result').hide();
            }
        });
        
        loadBook("tieto")
            .then(function () {
                submitQuery();
            });
        
    }

    jQuery(document).ready(run);

})();

