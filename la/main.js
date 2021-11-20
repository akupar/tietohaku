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
    
    function getPages(lista, hs) {
	hs = normalizeQuery(hs);
        
	var ed = null;
	for ( var i in lista ) {
	    if ( lista[i].aak > hs ) {
		return [ ed, lista[i] ];
	    }
	    ed = lista[i];
	}
        
	return [ ed, null ];
    }

    
    function normalizeQuery(e) {
	e = e.toUpperCase(e);
	e = e.replace(/[^A-ZÅÄÖ0-9]/g, "");
        
	return e;
    }
    
    
    function zeropad(num) {
        var num_s = String(num);
        var s = "0000" + num_s;
        return s.substr(num_s.length);
    }

    window.zeropad = zeropad;

    function makeURL(pref, sivuno) {
        return pref + zeropad(sivuno) + ".html";

    }


    function getResults(hs) {
        var result = [];
        var data = window.data;
        
        for ( bookTitle in data ) {
            var book = data[bookTitle];
            
            var rbook = {
                title: bookTitle,
                parts: []
            };

            for ( bookPartTitle in book ) {
                if ( bookPartTitle.startsWith("_") ) {
                    continue;
                }
                var sivut = getPages(book[bookPartTitle], hs);
		var ed = sivut[0];
		var seur = sivut[1];

                rbook.parts.push({
                    title: bookPartTitle,
                    prev: ed,
                    next: seur
                })
                
            }
            
            result.push(rbook);
        }
        
	return result;
    }

    function $formatPage(page, urlpref) {
        var $pageLi = $("<li></li>");

        if ( page ) {
            $pageLi.append(page.hakusana + ": ");
            $pageLi.append(
                $('<a></a>')
                    .attr('target', '_blank')
                    .attr('rel', 'noopener')
                    .attr('href', makeURL(urlpref, page.sivu))
                    .text(page.sivunro)
            );
        } else {
            $pageLi.append("–");
        }
        
        return $pageLi;
    }
    
    function $formatPages(prev, next, urlpref) {
        var $pagesUl = $('<ul></ul>');
        
        $pagesUl.append($formatPage(prev, urlpref));
        $pagesUl.append($formatPage(next, urlpref));        

        return $pagesUl;

    }
    
    function $formatPart(part, urlpref) {
        var $partLi = $("<li></li>");
        
        $partLi.append($("<span></span>").text(part.title));            
        $partLi.append($formatPages(part.prev, part.next, urlpref));
        
        return $partLi;
    }
    

    function $formatParts(parts, urlpref) {
        var $partsUl = $('<ul></ul>');
        
        for ( var part of parts ) {
            $partsUl.append($formatPart(part, urlpref));
        }

        return $partsUl;

    }

    function $formatBook(book) {
        var $bookLi = $("<li></li>");
        $bookLi.attr('id', 'li-' + escapeClassName(book.title));
        
        $bookLi.append($("<span></span>").text(book.title));            
        $bookLi.append($formatParts(book.parts, book._urlpref));

        var name = escapeClassName(book.title);
        if ( $('[name=' + name + ']').get(0).checked ) {
            $bookLi.css("display", "list-item");
        } else {
            $bookLi.css("display", "none");
        }
        
        return $bookLi;
    }

    function $formatBooks(books) {
        var $booksUl = $('<ul></ul>');
        
        for ( var book of books ) {
            $booksUl.append($formatBook(book));
        }

        return $booksUl;
    }

    function toggleVisibility($event) {
        var name = $($event.target).attr('name');
        var selector = "#li-" + name;
        
        if ( $event.target.checked ) {
            $(selector).show();
        } else {
            $(selector).hide();
        }
    }

    function $makeBookList() {
        var data = window.data;
        var $ul = $('<ul class="booklist"></ul>');
        
        for ( bookTitle in data ) {
            var $label = $('<label></label>')
                .text(" " + bookTitle)
                .prepend(
                    $('<input type="checkbox" />')
                        .change(toggleVisibility)
                        .attr('name', escapeClassName(bookTitle))
                )

            $ul.append($('<li></li>')
                .append($label)
            );
        }

        return $ul;
    }

    function run($) {
	var $frm_lomake = $("#lomake");	
	var $btn_hae = $("#hae");	
	var $tb_hakusana = $("#hakusana");

        $("#sidebar").append($makeBookList());

	$frm_lomake.submit(function ($event) {
	    var hs = $tb_hakusana.val();
            
            $event.preventDefault();

            var result = getResults(hs);

            $('#tulos').html($formatBooks(result));

	    return false;
	});

        if ( $("#hakusana").val() !== "" ) {
            $("#lomake").submit();
        }
    }

    jQuery(document).ready(run);

})(window);


