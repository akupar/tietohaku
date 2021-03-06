(function(w){

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
        var books = window.loadedBooks;
        
        for ( var book of books ) {
            
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
            
            result.push(rbook);
        }

	return result;
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

        if ( $('[name=' + part.id + ']').attr('checked') ) {
            $partLi.show();
        } else {
            $partLi.hide();
        }        
        
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
        var $bookDiv = $("#book-" + book.id);
        
        var $partsUl = $result_formatParts(book.parts, book.urlpref);
        if ( $bookDiv.children("ul").length === 0 ) {
            $partsUl.hide();
        } else {
            $bookDiv.children("ul").html("");
        }
        $bookDiv.append($partsUl);

        if ( $('[name=' + book.id + ']').attr('checked') ) {
            $bookDiv.show();
        } else {
            $bookDiv.hide();
        }

        $partsUl.slideDown();
        
        return $bookDiv;
    }

    function $result_formatBooks(books) {
        
        for ( var book of books ) {
            $result_formatBook(book);
        }

    }


    function $bookList_formatPart(part, partId) {
        var $partLi = $("<li></li>");
        var $label = $('<label></label>').text(" " + part.title);
        var $checkbox = $('<input type="checkbox" />').attr('name', partId);
        
        $checkbox.change(partSelectionChange);
        
        $checkbox.attr('checked', true);
        
        $label.prepend($checkbox);
        $partLi.append($label);

        return $partLi;
    }
    

    function $bookList_formatParts(parts, bookId) {
        var $partsUl = $('<ul></ul>');
        
        for ( var i in parts ) {
            $partsUl.append($bookList_formatPart(parts[i], bookId + "-" + i));
        }

        return $partsUl;

    }

    function bookList_loadBook(book) {
        var $partsUl = $bookList_formatParts(book.parts, book.id);
        $partsUl.hide();

        var $bookLi = $('#select-' + book.id);
        $bookLi.append($partsUl);
        
        $partsUl.slideDown();
    }    

    
    function $booklist_formatBook(book) {
        var $checkbox = $('<input type="checkbox" />');
        $checkbox.attr('name', book.id);
        $checkbox.change(bookSelectionChange);

        var $label = $('<label></label>');
        $label.text(" " + book.title);
        $label.prepend($checkbox);

        var $bookLi = $("<li></li>");
        $bookLi.attr('id', 'select-' + book.id);
        $bookLi.append($label);

        return $bookLi;
    }

    function $booklist_formatBooks(books) {
        var $booksUl = $('<ul></ul>');
        
        for ( var book of books ) {
            $booksUl.append($booklist_formatBook(book));
        }

        return $booksUl;
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


    function loadBook(bookId, shownBooks) {
        var scriptName = "data/" + bookId + ".js";
        var d = $.Deferred();
        
        var script = document.createElement('script');
        script.onload = function () {
            var $bookLi = $('#select-' + bookId);
            var bookTitle = $bookLi.children('label').text();
            var book = window.loadedBooks.find(function (book) { return book.id === bookId; });
            book.id = bookId;
            book.title = bookTitle;

            $('[name="' + bookId + '"]').attr('checked', true);
            bookList_loadBook(book, shownBooks);

            console.log("LOADED:", book.id);
            d.resolve();
        };

        script.src = scriptName;
        document.head.appendChild(script);    

        
        

        return d;
    }


    function loadBooks(shownBooks) {
        var loadings = [];
        
        for ( var bookId of shownBooks ) {
            if ( bookId.indexOf("-") === -1 ) {
                loadings.push(
                    loadBook(bookId, shownBooks)
                );
            }
        }

        return $.when.apply($, loadings);
    }
    

    function getShownBooks(query) {
        if ( !query.show ) {
            return [];
        }
        var items = query.show.split(" ");
        var bookAndPartNames = items.flatMap(function (item) {
            var bookAndParts = item.split('-');
            var bookId = bookAndParts[0];
            var partNums = bookAndParts.slice(1);
            
            var partNames = partNums.map(function (partNum) {
                return bookId + "-" + partNum;
            });

            return [bookId].concat(partNames)
        });

        return bookAndPartNames;
    }

    function addHistoryItem(state) {
        state = removeUndefined(state);
        
        history.pushState(state, '”' + state.term + '” – Hae Tietosanakirjasta', "?" + $.param(state).replaceAll("%2B", " "));
    }

    function bookSelectionChange($event) {
        var $thisCheckbox  = $($event.target);
        var bookId = $thisCheckbox.attr('name');
        var loaded = window.loadedBooks.find(function (book) { return book.id === bookId; });
        var query = getQuery();
        var shownBooks = getSelectedBooks();
        var $resultBlock = $('#book-' + bookId);
        var $partsUl = $thisCheckbox.parent().next("ul");
        var $partCheckboxes = $partsUl.find('[type="checkbox"]');
        
        var atleastOneChecked = false;
        $partCheckboxes.each(function () {
            atleastOneChecked ||= $(this).attr('checked');
        });
        
        
        
        if ( $thisCheckbox.attr('checked') === true ) {
            if ( !atleastOneChecked ) {
                $partCheckboxes.attr('checked', true);
            }
            if ( !loaded ) {
                loadBook(bookId, shownBooks).then(function () {
                    submitQuery();
                });
            } else {
                $partsUl.slideDown();
                if ( $resultBlock.length > 0 ) {
                    $resultBlock.slideDown();
                } else {
                    submitQuery();
                }
            }
        } else if ( $thisCheckbox.attr('checked') === false ) {
            $partsUl.slideUp();
            $resultBlock.slideUp();
        }

        addHistoryItem({
            term: query.term,
            show: formatUrlBooks(getSelectedParts())
        });
        
    }

    
    function partSelectionChange($event) {
        var $thisCheckbox  = $($event.target);
        var bookId = $thisCheckbox.attr('name');
        var query = getQuery();
        var $resultBlock = $('#' + bookId);
        var $siblings = $thisCheckbox.closest('ul').find('input[type="checkbox"]');
        var $parent = $thisCheckbox.closest('ul').parent('li').children('label').find('input[type="checkbox"]');            
        var atleastOneChecked = false;
        $siblings.each(function () {
            atleastOneChecked ||= $(this).attr('checked');
        });
        
        if ( $thisCheckbox.attr('checked') === true ) {
            $parent.attr('checked', true);
            $resultBlock.slideDown();
        } else if ( $thisCheckbox.attr('checked') === false ) {
            if ( !atleastOneChecked ) {
                $parent.attr('checked', false);
            } else {
                $resultBlock.slideUp();
            }
        }

        addHistoryItem({
            term: query.term,
            show: formatUrlBooks(getSelectedParts())
        });
        
    }
    
    function formatUrlBooks(shownBooks) {
        var partNames = shownBooks.filter(function (bookOrPartName) { return bookOrPartName.indexOf("-") > -1; });

        var map = {};
        
        partNames.forEach(function (partName) {
            var p = partName.split("-");
            var bookId = p[0];
            var partNum = p[1];
            
            if ( !map[bookId] ) {
                map[bookId] = [];
            }
            map[bookId].push(partNum);
        });

        var out = [];
        
        for ( var bookId in map ) {
            var parts = map[bookId].sort();

            out.push(bookId + "-" + parts.join("-"));
        }

        if ( out.length === 0 ) {
            return undefined;
        }

        return out.join(" ");
    }

    function showGoogleSearchButtons() {
        $('#sidebar li').each(function () {
            const id = $(this).attr('id');
            const book = id.replace('select-', '');
            const $button = $('<input type="button" value="G" />');
            $button.attr('title', 'Google-haku kirjan sisällöstä');
            $button.attr('class', 'ghaku');
            $button.click(event => {
                const searchTerms = $('#hakusana').val();
                if ( searchTerms.trim() === "" ) {
                    setError("Virhe: Ei hakusanaa. Kirjoita hakusana Artikkeli-kenttään.");
                    return;
                }
                const searchQuery = searchTerms + ' site:runeberg.org/' + book;
                const url = 'https://www.google.fi/search?' + $.param({ q: searchQuery });
                window.open(url, "_blank");
            });
            $(this).append($button);
        });
    }


    function submitQuery($event) {
        if ( $event ) {
            $event.preventDefault();
        }

	var queryTerm = $("#hakusana").val();
        if ( !queryTerm ) {
            return false;
        }

        var selectedBooks = getSelectedBooks();
        var selectedParts = getSelectedParts();

        if ( selectedBooks.length === 0 || selectedParts.length === 0 ) {
            setError("Virhe: Ei valittuja kirjoja tai osia. Valitse kirjat ja osat, joista haetaan.");
        }

        $('title').text('”' + queryTerm + '” – Haku (' + selectedBooks.join(", ") + ')');
        var result = getResults(queryTerm);

        $result_formatBooks(result);

        addHistoryItem({
            term: queryTerm,
            show: formatUrlBooks(getSelectedParts())
        });

        return false;
    }

    

    function run() {
        var query = getQuery();

        $("#hakusana").val(query.term || "");

	$("#lomake").submit(submitQuery);

        var allBooks = [];
        $('.book-result').each(function () {
            var id = $(this).attr('id').replace(/^book-/, '');
            var title = $(this).children('h2').text().trim();
            allBooks.push({
                id: id,
                title: title
            });
        });

        $('#sidebar').append($booklist_formatBooks(allBooks));
        

        var shownBooks = getShownBooks(query);
        
        loadBooks(shownBooks)
            .then(function () {
                submitQuery();
            });

        showGoogleSearchButtons();

    }

    jQuery(document).ready(run);

})(window);


