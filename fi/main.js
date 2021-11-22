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

    function getPages(array, needle) {
        needle = normalizeQuery(needle);
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



    function normalizeQuery(e) {
	e = e.toUpperCase(e);

	e = e.replace(/Æ/g, "Ä");
	e = e.replace(/Ø/g, "Ö");
	e = e.replace(/É/g, "E");
	e = e.replace(/Č/g, "C");
	e = e.replace(/Š/g, "S");
	e = e.replace(/Ž/g, "Z");
	e = e.replace(/W/g, "V");

	e = e.replace(/[^A-ZÅÄÖ0-9]/g, "");
	e = e.replace(/Å/g, "a");
	e = e.replace(/Ä/g, "b");
	e = e.replace(/Ö/g, "c");
        
	return e;
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
                var pages = getPages(bookPart.pages, hs);
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

        if ( $('[name=' + part.id + ']').get(0).checked ) {
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
        var $bookLi = $("<li></li>");
        $bookLi.attr('id', book.id);
        
        $bookLi.append($("<span></span>").text(book.title));
        var $partsUl = $result_formatParts(book.parts, book.urlpref);
        $partsUl.hide();
        $bookLi.append($partsUl);

        if ( $('[name=' + book.id + ']').get(0).checked ) {
            $bookLi.show();
        } else {
            $bookLi.hide();
        }

        $partsUl.slideDown();
        
        return $bookLi;
    }

    function $result_formatBooks(books) {
        var $booksUl = $('<ul></ul>');
        
        for ( var book of books ) {
            $booksUl.append($result_formatBook(book));
        }

        return $booksUl;
    }


    function $bookList_formatPart(part, id, shownBooks) {
        var $partLi = $("<li></li>");
        var $label = $('<label></label>').text(" " + part.title);
        var $checkbox = $('<input type="checkbox" />').attr('name', id);
        
        $checkbox.change(partSelectionChange);
        
        if ( id in shownBooks ) {
            $checkbox.attr('checked', false);
        } else {
            $checkbox.attr('checked', true);
        }
        
        
        $label.prepend($checkbox);
        $partLi.append($label);

        return $partLi;
    }
    

    function $bookList_formatParts(parts, book, shownBooks) {
        var $partsUl = $('<ul></ul>');
        
        for ( var i in parts ) {
            $partsUl.append($bookList_formatPart(parts[i], book.id + "-" + i, shownBooks));
        }

        return $partsUl;

    }

    function bookList_loadBook(book, shownBooks) {
        var $bookLi = $('#book-' + book.id);

        var $partsUl = $bookList_formatParts(book.parts, book, shownBooks);
        $partsUl.hide();
        $bookLi.append(
            $partsUl
        );
        $partsUl.slideDown();
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


    function loadBook(bookName, shownBooks) {
        var scriptName = "data/" + bookName + ".js";
        var d = $.Deferred();
        
        var script = document.createElement('script');
        script.onload = function () {
            var book = window.loadedBooks.find(function (book) { return book.id === bookName; });
            $('[name="' + bookName + '"]').attr('checked', true);
            bookList_loadBook(book, shownBooks);

            d.resolve();
        };
        
        script.src = scriptName;
        document.head.appendChild(script);

        return d;
    }


    function loadBooks(shownBooks) {
        var loadings = [];
        
        for ( var bookName of shownBooks ) {
            if ( bookName.indexOf("-") === -1 ) {
                loadings.push(
                    loadBook(bookName, shownBooks)
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
            var bookName = bookAndParts[0];
            var partNums = bookAndParts.slice(1);
            
            var partNames = partNums.map(function (partNum) {
                return bookName + "-" + partNum;
            });

            return [bookName].concat(partNames)
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
        var $children = $thisCheckbox.parent().next("ul").find('[type="checkbox"]');
        var atleastOneChecked = false;
        $children.each(function () {
            atleastOneChecked ||= $(this).attr('checked');
        });
        var $resultBlock = $('#' + bookId);
        
        if ( $thisCheckbox.attr('checked') === true ) {
            if ( !atleastOneChecked ) {
                $children.attr('checked', true);
            }
            if ( !loaded ) {
                loadBook(bookId, shownBooks).then(function () {
                    submitQuery();
                });
            } else {
                $thisCheckbox.parent().next("ul").slideDown();
                if ( $resultBlock.length > 0 ) {
                    $resultBlock.slideDown();
                } else {
                    submitQuery();
                }
            }
        } else if ( $thisCheckbox.attr('checked') === false ) {
            $thisCheckbox.parent().next("ul").slideUp();
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
            var bookName = p[0];
            var partNum = p[1];
            
            if ( !map[bookName] ) {
                map[bookName] = [];
            }
            map[bookName].push(partNum);
        });

        var out = [];
        
        for ( var bookName in map ) {
            var parts = map[bookName].sort();

            out.push(bookName + "-" + parts.join("-"));
        }

        if ( out.length === 0 ) {
            return undefined;
        }

        return out.join(" ");
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

        $('title').text('”' + queryTerm + '” – Tietohaku (suomi)');
        var result = getResults(queryTerm);

        $('#result').html($result_formatBooks(result));

        addHistoryItem({
            term: queryTerm,
            show: formatUrlBooks(getSelectedParts())
        });

        return false;
    }

    

    function run() {
        var query = getQuery();

        $("#hakusana").val(query.term || "");

        $('[type="checkbox"]').change(bookSelectionChange);
	$("#lomake").submit(submitQuery);
        

        var shownBooks = getShownBooks(query);
        
        loadBooks(shownBooks)
            .then(function () {
                submitQuery();
            });
        

        

    }

    jQuery(document).ready(run);

})(window);


