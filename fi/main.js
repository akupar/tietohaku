(function(w){
    function escapeClassName(className) {

        //return className.replace(/[^a-zA-Z0-9_-]/g, "");
        
        // ei toimi firefoxin inspectorilla
        return className.replace(/./g, function (char) {
            if ( char.match(/[a-zA-Z0-9_-]/) ) {
                return char;
            }
            else if ( char in [ "!", '"', "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", ":",
                                ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "`", "{", "|", "}", "~" ] ) {

                return "\\" + char;                
                //return "\\" + char;
            } else {
                return "";
                //return "\\" + parseInt(char.charCodeAt(0), 16);
            }
        });
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
    
    
    function zeropad(num) {
        var num_s = String(num);
        var s = "0000" + num_s;
        return s.substr(num_s.length);
    }

    window.zeropad = zeropad;

    function makeURL(pref, page) {
        return pref + page + ".html";

    }


    function getResults(hs) {
        var result = [];
        var books = window.books;
        
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
        $bookLi.append($result_formatParts(book.parts, book.urlpref));

        if ( $('[name=' + book.id + ']').get(0).checked ) {
            $bookLi.show();
            $("[name=" + book.id + "]").parent().next("ul").find("input").attr('disabled', false);
        } else {
            $bookLi.hide();
            $("[name=" + book.id + "]").parent().next("ul").find("input").attr('disabled', true);
        }
        
        return $bookLi;
    }

    function $result_formatBooks(books) {
        var $booksUl = $('<ul></ul>');
        
        for ( var book of books ) {
            $booksUl.append($result_formatBook(book));
        }

        return $booksUl;
    }

    function toggleVisibility($event) {
        var elemId = $($event.target).attr('name');
        var selector = "#" + elemId;
        
        if ( $event.target.checked ) {
            $(selector).slideDown();
            $("[name=" + elemId + "]").parent().next("ul").find("input").attr('disabled', false);
        } else {
            $(selector).slideUp();
            $("[name=" + elemId + "]").parent().next("ul").find("input").attr('disabled', true);
        }
    }


    function $bookList_formatPart(part, id, hiddenBooks) {
        var $partLi = $("<li></li>");
        var $label = $('<label></label>').text(" " + part.title);
        var $checkbox = $('<input type="checkbox" />').attr('name', id);
        $checkbox.change(toggleVisibility);
        if ( id in hiddenBooks ) {
            $checkbox.attr('checked', false);
        } else {
            $checkbox.attr('checked', true);
        }
        
        
        $label.prepend($checkbox);
        $partLi.append($label);

        return $partLi;
    }
    

    function $bookList_formatParts(parts, book, hiddenBooks) {
        var $partsUl = $('<ul></ul>');
        
        for ( var i in parts ) {
            $partsUl.append($bookList_formatPart(parts[i], book.id + "-" + i, hiddenBooks));
        }

        return $partsUl;

    }

    function $bookList_formatBook(book, hiddenBooks) {
        var $bookLi = $("<li></li>");
        var $label = $('<label></label>').text(" " + book.title);
        var $checkbox = $('<input type="checkbox" />').attr('name', book.id);
        $checkbox.change(toggleVisibility);
        if ( book.id in hiddenBooks ) {
            $checkbox.attr('checked', false);
        } else {
            $checkbox.attr('checked', true);
        }


        $label.prepend($checkbox);
        
        $bookLi.append($label);
        $bookLi.append($bookList_formatParts(book.parts, book, hiddenBooks));

        return $bookLi;
    }

    function $bookList_formatBooks(books, hiddenBooks) {
        var $booksUl = $('<ul class="booklist"></ul>');
        
        for ( var book of books ) {
            $booksUl.append($bookList_formatBook(book, hiddenBooks));
        }

        return $booksUl;
    }
    

    function $makeBookList(hiddenBooks) {
        var books = window.books;

        return $bookList_formatBooks(books, hiddenBooks);
    }

    function getQuery() {
        var urlSearchParams = new URLSearchParams(window.location.search);
        return Object.fromEntries(urlSearchParams.entries());
    }

    function getHiddenBooks() {
        var $cbs = $('input[type="checkbox"]');
        var list = [];
        
        $cbs.each(function () {
            if ( $(this).attr('checked') === false ) {
                list.push($(this).attr('name'));
            }
        });

        return list.join(",");
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

    function run($) {
	var $frm_lomake = $("#lomake");	
	var $btn_hae = $("#hae");	
	var $tb_hakusana = $("#hakusana");

        var query = getQuery();

        if ( query.term ) {
            $('title').text('”' + query.term + '” – Tietohaku (suomi)');
            $tb_hakusana.val(query.term);            
        }



        var hiddenBooks = {};
        if ( query.hide ) {
            hiddenBooks = query.hide.split(",").reduce(function (o, x) { o[x] = true; return o;}, {});
        }
        
        $("#sidebar").append($makeBookList(hiddenBooks));

	$frm_lomake.submit(function ($event) {
	    var hs = $tb_hakusana.val();
            $event.preventDefault();
            if ( !hs ) {
                return false;
            }
            
            var params = 
                window.location.search = "?" + $.param(
                    removeUndefined({
                        term: $tb_hakusana.val(),
                        hide: getHiddenBooks() || undefined
                    })
                );
	});

        if ( query.term ) {
            var result = getResults(query.term);

            $('#result').html($result_formatBooks(result));
        }
    }

    jQuery(document).ready(run);

})(window);


