(function(w){

    function getPages(lista, hs) {
	hs = normalizeQuery(hs);
        
	var ed = null;
	for ( var i in lista ) {
	    if ( lista[i].aak >= hs ) {
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

    function run($) {
	var $frm_lomake = $("#lomake");	
	var $btn_hae = $("#hae");	
	var $tb_hakusana = $("#hakusana");
	var $sp_output11 = $("#tulos_paaosa_ed");
	var $sp_output12 = $("#tulos_paaosa_seur");
	var $sp_output21 = $("#tulos_taydosa_ed");
	var $sp_output22 = $("#tulos_taydosa_seur");

	$frm_lomake.submit(function ($event) {
	    var urlpref = "http://runeberg.org/lafi1974/";
            
            $event.preventDefault();

            $('#tulos').show();
            
	    var hs = $tb_hakusana.val();

	    {
		var sivut = getPages(window.paaosa, hs);
		if ( sivut ) {
		    var ed = sivut[0];
		    var seur = sivut[1];

                    $sp_output11.html("");
		    $sp_output11.append(ed.hakusana + ": ");                    
		    $sp_output11.append(
                        $('<a></a>')
                            .text(ed.sivu)
                            .attr('href', makeURL(urlpref, ed.sivu))
                    );

                    $sp_output12.html("");                    
                    if ( seur ) {
                        $sp_output12.append(seur.hakusana + ": ");
                        $sp_output12.append(                        
                            $('<a></a>')
                                .text(seur.sivu)
                                .attr('href', makeURL(urlpref, seur.sivu)));
                    } else {
                        $sp_output12.append("—");
                    }
		}
	    }

	    {
		var sivut = getPages(window.liite, hs);
		if ( sivut ) {
		    var ed = sivut[0];
		    var seur = sivut[1];

                    $sp_output21.html("");
                    $sp_output21.append(ed.hakusana + ": ");
                    $sp_output21.append(
                        $('<a></a>')
                            .text(ed.sivu)
                            .attr('href', makeURL(urlpref, ed.sivu))
                    );

                    $sp_output22.html("");                    
                    if ( seur ) {
                        $sp_output22.append(seur.hakusana + ": ");
                        $sp_output22.append(                        
                            $('<a></a>')
                                .text(seur.sivu)
                                .attr('href', makeURL(urlpref, seur.sivu)));
                    } else {
                        $sp_output22.append("—");
                    }
		}
	    }
	    return false;
	});

        if ( $("#hakusana").val() !== "" ) {
            $("#lomake").submit();
        }
    }

    if ( $("#hakusana").val() === "" ) {
        $('#tulos').hide();
    }
    
    jQuery(document).ready(run);

})(window);


