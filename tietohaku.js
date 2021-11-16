(function(w){

    function hae_sivut(lista, hs) {
	hs = kasittele(hs);
	var ed = null;
	for ( var i in lista ) {
	    //console.log(lista[i][0] + " >= " + hs + " ?");
	    if ( lista[i][0] >= hs ) {
		return [ ed, lista[i] ];
	    }
	    ed = lista[i];
	}
	return [ ed, ["", ""]];
    }

    function kasittele(e) {
	e = e.toUpperCase(e);
	e = e.replace(/Æ/g, "Ä");
	e = e.replace(/Ø/g, "Ö");
	e = e.replace(/É/g, "E");
	e = e.replace(/Č/g, "C");
	e = e.replace(/Š/g, "S");
	e = e.replace(/Ž/g, "Z");
	e = e.replace(/[^A-ZÅÄÖ0-9]/g, "");
	e = e.replace(/Å/g, "a");
	e = e.replace(/Ä/g, "b");
	e = e.replace(/Ö/g, "c");
	e = e.replace(/W/g, "V");
	return e;
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
	    var urlpref = "http://runeberg.org/tieto/";
            
            $event.preventDefault();

            $('#tulos').show();
            
	    if ( !window.sivut ) {
		window.sivut = [].concat(window.osa1,
					    window.osa2,
					    window.osa3,
					    window.osa4,
					    window.osa5,
					    window.osa6,
					    window.osa7,
					    window.osa8,
					    window.osa9,
					    window.osa10
					   );
		window.lisasivut = window.lisaosa;
	    }

	    var hs = $tb_hakusana.val();

	    {
		var sivut = hae_sivut(window.sivut, hs);
		if ( sivut ) {
		    var ed = sivut[0];
		    var seur = sivut[1];
		    $sp_output11.html(ed[1] + ": " + ed.slice(2)
				      .join(", ")
				      .replace(/href="/g, 'href="' + urlpref));
		    $sp_output12.html(seur[1] + ": " + seur.slice(2)
				      .join(", ")
				      .replace(/href="/g, 'href="' + urlpref));
		}
	    }

	    {
		var sivut = hae_sivut(window.lisasivut, hs);
		if ( sivut ) {
		    var ed = sivut[0];
		    var seur = sivut[1];
		    $sp_output21.html(ed[1] + ": " + ed.slice(2)
				      .join(", ")
				      .replace(/href="/g, 'href="' + urlpref));
		    $sp_output22.html(seur[1] + ": " + seur.slice(2)
				      .join(", ")
				      .replace(/href="/g, 'href="' + urlpref));
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

