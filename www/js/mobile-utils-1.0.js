const $API_KEY = "AIzaSyA51Su8K06kRq12OSHP_nR1WcEZTy4CMj8";

var $ci = new Array();
var $ciheader = new Array();
var $ciul = new Array();
var $ciulli = new Array();
var $lievent = new Array();
var $lidivevent = new Array();

var $gafu = new Array();
var $gafucounter =0;
var $gafu2 = new Array();
var $gafucounter2 =0;

var $searchresult = new Array();
var $tableToSort = new Array();
var $tableAPList = new Array();
var $tableEventsList = new Array();
var $nextGPToken = "X";
var $id;
var $prepend;
var $geocoder=new google.maps.Geocoder();

var $step=0;

const $api="api.dev.nearby.art-please.org";
const $apidev="api.frapi.artplease";
const $DEFAULTDESC = '<p>This gallery didn\'t subscribe to Art-Please service. Tell them about us and help us to enlarge our database</p>';
const $ga_id="UA-45262384-3";
//Google Universal Analytics
var $v='';             // Version.
var $tid='';  // Tracking ID / Web property / Property ID.
var $cid=''; //Client id
var $sr='';//screen resolution
var $vp='';//viewport size
var $sd='';//acreen color depth
var $ul=''; //user language
var $an='';//application name
var $av=''; //application version

/*!
 * return get variable
 *
 * dependancy: none
 *
 * Date: 2013-09-23T14:31
 */	 
function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
	});
	return vars;
}

/*!
 *Initialize var before a search
 *
 * dependancy: none
 *
 * Date: 2013-10-11T06:26
 */
function initBeforeSearch()
{
	$searchresult = new Array();
	$tableToSort = new Array();
	$nextGPToken = "X";

	$step=0;
}
/*!
 * Get the lat and lng of the current position
 *
 * dependancy: jQuery, geo-min.js
 *
 * Date: 2013-09-18T06:26
 */
 
function initialize() //get lat and lng
{
	if(geo_position_js.init())
	{
		console.log("ready to get location");
		$.mobile.loading( 'show', {
		  text: "Getting location...",
		  textVisible: true,
		  theme: "a",
		});
		console.log("get position without geo-min");
		//geo_position_js.getCurrentPosition(show_position,show_error,{enableHighAccuracy:true});
		navigator.geolocation.getCurrentPosition(show_position,show_error,{maximumAge:0,enableHighAccuracy:true,timeout:5000});
		console.log("position get!");
		sessionStorage.radius=1000;
	}
	else
	{
		$.mobile.loading( 'show', {
		  text: "Functionality not available!",
		  textVisible: true,
		  theme: "a",
		});
	
		setTimeout( function(){$.mobile.loading( "hide" );}, 1500 );
	}
	
}

/*!
 * onSuccess callback function initialize 
 *
 * dependancy: jQuery
 *
 * Date: 2013-09-18T06:26
 */
function show_position(p) //Save coordinates in sessionStorage
{
	console.log("enter success callback");
	$.mobile.loading( "hide" );
	
	sessionStorage.lat = p.coords.latitude;
	sessionStorage.lng = p.coords.longitude;

	$("#currentLat").text(sessionStorage.lat);
	$("#currentLng").text(sessionStorage.lng);
	
}
/*!
 * onError callback function initialize 
 *
 * dependancy: jQuery
 *
 * Date: 2013-09-18T06:26
 */
function show_error(p) 
{
	console.log("enter fail callback");
	$.mobile.loading( "hide" );
	$.mobile.loading( 'show', {
	  text: "Couldn't get location! Did you enable Google's location service or GPS?",
	  textVisible: true,
	  theme: "a",
	});
	setTimeout( function(){$.mobile.loading( "hide" );}, 1500 );

}

/*!
 * End the creation of the listview galeriessearch with the result of the retrieveArtPlacesData function
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-11T06:26
 */
function endArtPlacesList()
{
	$.mobile.loading( "hide" );

	$($tableAPList[sessionStorage.currentPage]).trigger('create');
	$($tableAPList[sessionStorage.currentPage]).listview ("refresh");
	
	$('div[id^="gal_num"]').on('click', function(event) { //Se déclenche lorsqu'on click sur une des div commençant par gal_num (celle générée par le get gallerie)
		// Retrieve the 'name' data attribute of the <a/> tag that the user clicked.
		$.mobile.loading('show');
		var name = $(event.target).closest('a').data('name');
		var $galgoogleid = $(event.target).closest('a').data('googleid');
		sessionStorage.name = name;
		sessionStorage.gal_id = $(event.target).closest('a').data('gal_id');
		sessionStorage.ap_type = $(event.target).closest('a').data('ap_type');
		sessionStorage.destlat = $(event.target).closest('a').data('gal_lat');
		sessionStorage.destlong = $(event.target).closest('a').data('gal_long');
		sessionStorage.vicinity = $(event.target).closest('a').data('gal_vicinity');
		sessionStorage.id = $galgoogleid;
		
		if (sessionStorage.ap_type=="1")
			trackclick(sessionStorage.name+'-'+sessionStorage.id,'vdetail','artist')
		else
			trackclick(sessionStorage.name+'-'+sessionStorage.id,'vdetail','gallery')
			
	});
	
	$($tableAPList[sessionStorage.currentPage]).css('display','block');	
	$($tableAPList[sessionStorage.currentPage]).css('visibility','visible');	
	$ci = new Array();
	$ciheader = new Array();
	$ciul = new Array();
	$ciulli = new Array();

	$step=0;		
}

/*!
 * Get photo from google otherwise get photo from artplease (artplease logo if no photo is available in Artplease). 
 *
 * dependancy: jQuery
 *
 * Date: 2013-09-18T06:26
 */
function getPhoto(artPlaceData, g_id){ //récupère la photo de la galerie si elle est disponible, sinon elle renvoie le logo ArtPlease.
	 if (artPlaceData['photo']!=""){
		return '<img src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=80&photoreference='+artPlaceData['photo']+'&sensor=false&key='+$API_KEY+'">';
	}
	else
	{
		if (artPlaceData['gal_id'])
			return '<img src="http://'+$api+'/artpleasenearby/getphoto.json?galid='+g_id+'&photoid=1>"';
		else
			return '<img src="http://'+$api+'/artpleasenearby/getphoto.json?googleid='+g_id+'&photoid=1>"';
	}
}

/*!
 * Search events
 *
 * dependancy: JQuery
 *
 * Date: 2013-12-11T19:56
 */
function searchevents()
{
	$($tableEventsList[sessionStorage.currentPage]).empty();
	$($tableEventsList[sessionStorage.currentPage]).hide();		
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "http://"+$api+"/artpleasenearby/geteventsnearby.json",
		cache: false,
		data: {
			lat:sessionStorage.lat,
			lng:sessionStorage.lng,
			radius:50000,
		},
		success: onSearcheventsSuccess,
		error: onSearcheventsError
	});
}

/*!
 * Search events by location
 *
 * dependancy: JQuery
 *
 * Date: 2013-12-13T16:20
 */
function searcheventsbylocation()
{
	$.mobile.loading( 'show');
	$($tableEventsList[sessionStorage.currentPage]).empty();
	$($tableEventsList[sessionStorage.currentPage]).hide();		
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "http://"+$api+"/artpleasenearby/mgetevents.json",
		cache: false,
		data: {
			city:$('#cityeventinput').val(),
			country:$('#selecteventcountry').val(),
			state:'XX',
		},
		success: onSearcheventsSuccess,
		error: onSearcheventsError
	});
}

/*!
 * Callback function on searchevents sucess
 *
 * dependancy: jQuery
 *
 * Date: 2013-12-10T07:02
 */
function onSearcheventsSuccess(data, status)
{
var $startDate;
var $endDate;


 
	//data = $.trim(data);
	$.mobile.loading( "hide" );

	$response = data;//JSON.parse(data);
	
	//console.dir($response);

		
	for(i=0;i<$response.length;i++){
		$startDate = moment($response[i].EVE_START_DATE);
		$endDate = moment($response[i].EVE_END_DATE);
		$lidivevent[i] = $('<li />').attr({'data-role':'list-divider'});
		$($lidivevent[i]).html($startDate.format("ddd, MMM Do YY")+' - '+$endDate.format("ddd, MMM Do YY"));
		$lievent[i] = $('<li />').attr({'id':'eve_num'+i});
		$($lievent[i]).html('<a href="eventdetails.html" data-eventname="'+$response[i].EVE_NAME+'" data-startdate="'+$startDate.format("ddd, MMM Do YY")+'" data-enddate="'+$endDate.format("ddd, MMM Do YY")+'" data-eventdesc="'+$response[i].EVE_DESC+'" data-eventaddress="'+$response[i].EVE_ADDRESS+'" data-eventid="'+$response[i].EVE_ID+'"><img src="http://'+$api+'/artpleasenearby/geteventlogo.json?eventid='+$response[i].EVE_ID+'"> <h2>'+$response[i].EVE_NAME+'</h2> <p>'+$response[i].EVE_DESC+'</p></a><a href="galerieseventlist.html" data-eventid="'+$response[i].EVE_ID+'">see details</a>');
		$($tableEventsList[sessionStorage.currentPage]).append($lidivevent[i]);
		$($tableEventsList[sessionStorage.currentPage]).append($lievent[i]);
				
		trackclick($response[i].EVE_NAME,'evlist','event')
	}
	$($tableEventsList[sessionStorage.currentPage]).trigger('create');
	$($tableEventsList[sessionStorage.currentPage]).listview ("refresh");
	$($tableEventsList[sessionStorage.currentPage]).css('display','block');	
	$($tableEventsList[sessionStorage.currentPage]).css('visibility','visible');

	$('li[id^="eve_num"]').on('click', function(event) { //Se déclenche lorsqu'on click sur une des div commençant par eve_num (celle générée par le get gallerie)
		// Retrieve the 'eventid' data attribute of the <a/> tag that the user clicked.
		$.mobile.loading('show');
		sessionStorage.eventid = $(event.target).closest('a').data('eventid');
		sessionStorage.eventname = $(event.target).closest('a').data('eventname');
		sessionStorage.eventstartdate = $(event.target).closest('a').data('startdate');
		sessionStorage.eventenddate = $(event.target).closest('a').data('enddate');
		sessionStorage.eventdesc = $(event.target).closest('a').data('eventdesc');
		sessionStorage.eventaddress = $(event.target).closest('a').data('eventaddress');
		sessionStorage.searchartplaceattachedtoeventdone="";
	});
	
	$lidivevent = new Array();
	$lievent = new Array();
}

/*!
 * Callback function on searchevents error
 *
 * dependancy: jQuery
 *
 * Date: 2013-12-10T07:02
 */
function onSearcheventsError(xhr, status, error){
	// handle an error
	$.mobile.loading( "hide" );

	$response = JSON.parse(xhr.responseText);

	if ($response.errors[0].message==null)
	{
		alert("Unexpected error ("+"error name: "+$response.errors[0].name+"  - error message: "+$response.errors[0].message+" - at :"+$response.errors[0].at +")");
	}
	else
	{

		alert($response.errors[0].message);

	}
}

/*!
 * Build list of galleries/Artists
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function retrieveArtPlacesData($artPlacesTable){//fonction callback de la fonction getGallerie() récupère les galeries aux alentours à l'aide de l'API Google Place
//Note : Il faudra revenir en arrière sur l'utilisation d $apd quand on passera sur le mobile car dans ce cas artPlaceData sera déjà un objet json

	if ($artPlacesTable.length==0) {
		$.mobile.loading( 'show', {
		  text: "No art places found",
		  textVisible: true,
		  theme: "a",
		});
	
		setTimeout( function(){$.mobile.loading( "hide" );}, 1500 );
	}
	else
	{
		
		for(i=0+$step;i<$artPlacesTable.length;i++){
				
				if ($artPlacesTable[i]["type"]==1)
				{
					trackclick($artPlacesTable[i]["name"]+'-'+$artPlacesTable[i]["id"],'vlist','artist');
					$datatheme   = "e";
				}
				else
				{
					trackclick($artPlacesTable[i]["name"]+'-'+$artPlacesTable[i]["id"],'vlist','gallery');
					$datatheme  = "b";
				}
				$ci[i] = $('<div />').attr({'data-role':'collapsible','data-theme':$datatheme,'data-collapsed':'false','data-content-theme':'d','id':'gal_num'+i});
				$ciheader[i] = $('<h2/>').attr({'id':'#galname'+i});
				$ciheader[i].text($artPlacesTable[i]["name"]+" "+$artPlacesTable[i]["distance"].toFixed(2)+" km ("+($artPlacesTable[i]["distance"]*0.621371192).toFixed(2)+" mi)");
				$ciul[i] = $('<ul/>').attr({'data-role':'listview','data-split-icon':'info','data-split-theme':'d'});
				//A noter ci-dessous l'utilisation du data-name pour pouvoir utiliser ce nom dans la page #PageDetailGallery contenant le détail de la galerie.
				$ciulli[i] = $('<li/>').html('<a href="#">'+getPhoto($artPlacesTable[i],$artPlacesTable[i]["id"])+'<h2><font style="white-space:normal">'+$artPlacesTable[i]["vicinity"]+'</font></h2></a><a href="galeriesdetails.html" data-transition="slidefade" data-name="'+$artPlacesTable[i]["name"]+'" data-googleid="'+$artPlacesTable[i]["id"]+'" data-gal_id="'+$artPlacesTable[i]["gal_id"]+'" data-ap_type="'+$artPlacesTable[i]["type"]+'" data-gal_lat="'+$artPlacesTable[i]["gal_lat"]+'" data-gal_long="'+$artPlacesTable[i]["gal_long"]+'" data-gal_vicinity="'+$artPlacesTable[i]["vicinity"]+'">More details</a>');
				$ciul[i].append($ciulli[i]);
				$ci[i].append($ciheader[i]);
				$ci[i].append($ciul[i]);
				
				$($tableAPList[sessionStorage.currentPage]).append($ci[i]);
				

		}
		
		endArtPlacesList();

	}
}
/*!
 * Calculate the distance from the user location to the art place
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-11T06:26
 */
function calcdistance($latTo, $longTo) {
	a=sessionStorage.latOrigin; //LatFrom
	b=sessionStorage.lngOrigin; //LongFrom
	c=$latTo; //LatTo
	d=$longTo; //LongTo

	e=(3.14159265358979*a/180); 
	f=(3.14159265358979*b/180); 
	g=(3.14159265358979*c/180);
	h=(3.14159265358979*d/180);
	$i=(Math.cos(e)*Math.cos(g)*Math.cos(f)*Math.cos(h)+Math.cos(e)*Math.sin(f)*Math.cos(g)*Math.sin(h)+Math.sin(e)*Math.sin(g)); 
	j=(Math.acos($i));
	k=Math.round(6371*j);
	return 6371*j;
}

/*!
 * Sort a table by a key using bubble sorting algo.
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-11T06:26
 */
function bubbleSort(a, par)
{
	var swapped;
	do {
		swapped = false;
		for (var i = 0; i < a.length - 1; i++) {
			if (a[i][par] > a[i + 1][par]) {
				var temp = a[i];
				a[i] = a[i + 1];
				a[i + 1] = temp;
				swapped = true;
			}
		}
	} while (swapped);
}

/*!
 * Transfert the search result table to a table to be sorted by distance
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-11T06:26
 */
function transfertTable()
{
			$iter=0;
			$tableToSort.length=0;
			for (i in $searchresult) {
				$tableToSort[$iter]={"name" : $searchresult[i][0], "id" : $searchresult[i][1],"vicinity" : $searchresult[i][2], "distance" : $searchresult[i][3],"type":$searchresult[i][4],"photo":$searchresult[i][5],"gal_id":$searchresult[i][6],"gal_lat":$searchresult[i][7],"gal_long":$searchresult[i][8]};//{var1 : t[i][0], var2 : t[i][1], var3 : t[i][2], var4 : t[i][3]};
				$iter++;
			}
}

/*!
 * Store the search result in a table in order o be sorted by distance later and to be used to create the listviesw 
 * in gallery search page
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-11T06:26
 */
function populateResultsTable($data,$google)
{

	if ($google==true) //call from google api search
	{
		$apd = $data;
		$length = $apd.results.length;
	}
	else //call from Art-Please DB search
	{
		$length = $data.length;
	}
	for(i=0;i<$length;i++){
		if ($google==true) //call from google api search
		{
			
			if (typeof($searchresult[$apd.results[i].id])=='undefined')	
			{
				if ($apd.results[i].hasOwnProperty('photos'))
					$refPhoto = $apd.results[i].photos[0].photo_reference;
				else
					$refPhoto = "";
				$searchresult[$apd.results[i].id]=new Array($apd.results[i].name,$apd.results[i].id,$apd.results[i].vicinity,calcdistance($apd.results[i].geometry.location.lat, $apd.results[i].geometry.location.lng),2,$refPhoto,false,$apd.results[i].geometry.location.lat, $apd.results[i].geometry.location.lng);
			}
		}
		else //call from Art Please DB api search
		{
			$vicinity="";
			if ($data[i].act_adressstreet_1!='null') $vicinity=$data[i].act_adressstreet_1+" ";
			if ($data[i].act_adressstreet_2!='null') $vicinity=$vicinity+$data[i].act_adressstreet_2+" ";
			if ($data[i].act_adresscity!='null') $vicinity=$vicinity+$data[i].act_adresscity;
			
			$gallery_name="";
			if ($data[i].act_galleryname!='null') 
				$gallery_name=$data[i].act_galleryname;
			else
				$gallery_name="unknow";
			
			if ($data[i].gal_google_id!=null) //Test if the galery in Art-Please DB has a google_id
			{
				if (typeof($searchresult[$data[i].gal_google_id])=='undefined') 
				{
					$searchresult[$data[i].gal_google_id]= new Array($gallery_name, $data[i].gal_google_id, $vicinity, parseFloat($data[i].dist),$data[i].act_type,"",false,$data[i].gal_lat,$data[i].gal_long);
				}
			}
			else //then use Art-Please DB id
			{
				if (typeof($searchresult[$data[i].gal_id])=='undefined') 
				{
					$searchresult[$data[i].gal_id]=new Array($gallery_name, $data[i].gal_id, $vicinity, parseFloat($data[i].dist),$data[i].act_type,"",true,$data[i].gal_lat,$data[i].gal_long);
				}
			}
		}
	}
	if ($google==true) 
	{
		$nextGPToken = $apd.next_page_token;
		if (typeof($apd.next_page_token)!='undefined' && $apd.next_page_token!="")
		{
			$nextGPToken = $apd.next_page_token;
			
		}
		else
		{
			$nextGPToken = "";
		}
	}

}

/*!
 * Get galleries and artists attached to an event from Art-Please DB
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function getArtPlacesAttachedToEvent($eventid)
{
		$.getJSON("http://"+$api+"/artpleasenearby/getartplacesbyevent.json?",
		{
		lat:sessionStorage.latOrigin,
		lng:sessionStorage.lngOrigin,	
		radius:50000,
		type:99,
		eventid:$eventid,
		},function(data){
		populateResultsTable(data,false);
		transfertTable();
		bubbleSort($tableToSort, "distance");
		retrieveArtPlacesData($tableToSort);
		});

}

/*!
 * Get galleries and artists from Art-Please DB
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function getArtPlacesFromDatabase()
{
//Note : Passer à getJson pour la version mobile pour interroger directement api APN
		$.getJSON("http://"+$api+"/artpleasenearby/getartplaces.json?",
		{
		lat:sessionStorage.latOrigin,
		lng:sessionStorage.lngOrigin,	
		radius:sessionStorage.radius,
		type:99,
		},function(data){populateResultsTable(data,false);});
		

}

/*!
 * Get galleries from GooglePlace
 *
 * dependancy: jQuery, GooglePlace API
 *
 * Date: 2013-10-17T14:32
 */
function getArtPlacesFromGooglePlace($nexttoken){
    if ($nexttoken== 'X' ){
        $nexttoken = "";
    }	
	
	//Get art Places from GooglePlace
	if ($nexttoken=="")
	{
		$.ajax({
			type: "GET",
			url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+sessionStorage.latOrigin+","+sessionStorage.lngOrigin,
			cache: false,
			async: false,
			data: {
				rankby:"distance",
				types:"art_gallery",
				sensor:false,
				key:$API_KEY,			
			},
			success : function(data){populateResultsTable(data,true);},
			error: function(){$nextGPToken="";}
		});

		if ($nextGPToken!="")
		{
			setTimeout("getArtPlacesFromGooglePlace($nextGPToken)",1500);
		}
		else
		{
			transfertTable();
	
			bubbleSort($tableToSort, "distance");
			retrieveArtPlacesData($tableToSort);
			$("#clearandsearch").css('display','block');	
			$("#clearandsearch").css('visibility','visible');	
		}
	}
	else
	{
		$.ajax({
			type: "GET",
			url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken="+$nexttoken,
			cache: false,
			async: false,
			data: {
				sensor:false,
				key:$API_KEY,			
			},
			success : function(data){populateResultsTable(data,true);},
			error: function(){$nextGPToken="";}
		});

		if ($nextGPToken!="")
		{
			setTimeout("getArtPlacesFromGooglePlace($nextGPToken)",1500);
		}
		else
		{
			transfertTable();
			bubbleSort($tableToSort, "distance");
			retrieveArtPlacesData($tableToSort);
			$("#clearandsearch").css('display','block');	
			$("#clearandsearch").css('visibility','visible');	
		}
	}
}

/*!
 * Save radius slider value (settings page)
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function saveSliderValue()
{
	sessionStorage.radius=$("#slider-distance").val();
}

/*!
 * Update gallerydetail page with data from Art-PLease DB (failed callback function of UpdateArtPLaceDetailPage)
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function defaultArtPlaceDetailPage()
{
	//Note : if gallery data dont exist in the Art-Please DB, an error is raised
	$("#artPlaceTel").html("&#9742; No tel. # avail.");
	$("#artPlaceUrl").html("&#9729; No url avail.");
	$('#ssidup').attr({"href":"javascript:alert('no slide show for this gallery!')"});
	$('#ssiddown').attr({"href":"javascript:alert('no slide show for this gallery!')"});
	$("#artPlaceName").html(sessionStorage.name);
	$("#descArtPlace").html($DEFAULTDESC);
	$("#imgGal1").attr({"src":"img/logoico.png"});
	$("#imgGal2").attr({"src":"img/logoico.png"});

	$.mobile.loading( "hide" );
}
/*!
 * Update gallerydetail page with data from Art-PLease DB (success callback function of UpdateArtPLaceDetailPage)
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function updateArtPlaceDetails(data, status)
{
	//reinit fields
	$("#artPlaceTel").html("&#9742; No tel. # avail.");
	$("#artPlaceUrl").html("&#9729; No url avail.");
	
	if (sessionStorage.ap_type==1) //Artist => No Limit
	{
		if (data[0].ACT_TEL_NUMBER!='null')
			$("#artPlaceTel").html('&#9742; '+'<a href=tel:"'+data[0].ACT_TEL_NUMBER.replace(/\s+/g, '')+'" onclick="return trackclick(\''+sessionStorage.name+'-'+sessionStorage.id+'\',\'tel\',\'artist\');">'+data[0].ACT_TEL_NUMBER+'</a>');

		if (data[0].ACT_URL!='null')
			$("#artPlaceUrl").html('&#9729; '+'<a href="javascript:iabRef = window.open(\''+data[0].ACT_URL+'\',\'_blank\',\'location=yes\',\'toolbar=yes\',\'closebuttoncaption=Return\');" onclick="return trackclick(\''+sessionStorage.name+'-'+sessionStorage.id+'\',\'url\',\'artist\');">'+data[0].ACT_URL+'</a>');

		$('#ssidup').attr({"href":$prepend+"galeriesslideshow.html","onclick":'return trackclick(\''+sessionStorage.name+'-'+sessionStorage.id+'\',\'ss\',\'artist\');'});
		$('#ssiddown').attr({"href":$prepend+"galeriesslideshow.html","onclick":'return trackclick(\''+sessionStorage.name+'-'+sessionStorage.id+'\',\'ss\',\'artist\');'});

                
                

	}
	else
	{
	//check if errors then show nothing else show subscribed options.
		
		if (sessionStorage.currentSubscriptions.indexOf("errors")!=-1)
		{
			$('#ssidup').attr({"href":"javascript:alert('no slide show for this gallery!')"});
			$('#ssiddown').attr({"href":"javascript:alert('no slide show for this gallery!')"});
		}
		else
		{
			$currentSubscriptions = JSON.parse(sessionStorage.currentSubscriptions);

			var $taille = Object.keys($currentSubscriptions).length;

			$today = new Date();
			
			$('#ssidup').attr({"href":"javascript:alert('no slide show for this gallery!')"});
			$('#ssiddown').attr({"href":"javascript:alert('no slide show for this gallery!')"});				
			for (var $count=0; $count<$taille; $count++)
			  {
				$time = (new Date($currentSubscriptions[$count]["SUBSPRD_EXPDATE"].replace(/-/g, "/"))).getTime();
				$expDate = new Date($time);

				switch ($currentSubscriptions[$count]["PRD_ID"]) //Get Product ID
				{
					case "1":
						// TELVISIBLE OPTION
						if ($today<=$expDate)
						  $("#artPlaceTel").html('&#9742; '+'<a href=tel:"'+data[0].ACT_TEL_NUMBER.replace(/\s+/g, '')+'" onclick="return trackclick(\''+sessionStorage.name+'-'+sessionStorage.id+'\',\'tel\',\'gallery\');">'+data[0].ACT_TEL_NUMBER+'</a>');
						break;
						
					case "2":
						if ($today<=$expDate)
							$("#artPlaceUrl").html('&#9729; '+'<a href="javascript:iabRef = window.open(\''+data[0].ACT_URL+'\',\'_blank\',\'location=yes\',\'toolbar=yes\',\'closebuttoncaption=Return\');" onclick="return trackclick(\''+sessionStorage.name+'-'+sessionStorage.id+'\',\'url\',\'gallery\');">'+data[0].ACT_URL+'</a>'); 
						break;
						
					case "3":
						// ACTIVATE SLIDESHOW OPTION;
						if ($today<=$expDate)
						{
							$('#ssidup').attr({"href":$prepend+"galeriesslideshow.html","onclick":'return trackclick(\''+sessionStorage.name+'-'+sessionStorage.id+'\',\'ss\',\'gallery\');'});
							$('#ssiddown').attr({"href":$prepend+"galeriesslideshow.html","onclick":'return trackclick(\''+sessionStorage.name+'-'+sessionStorage.id+'\',\'ss\',\'gallery\');'});
						}
						break;
				}
			}
		}
	}
	$("#artPlaceName").html(sessionStorage.name);
	$("#descArtPlace").html(data[0].GAL_DESC);
	$("#imgGal1").attr({"src":"http://"+$api+"/artpleasenearby/getphoto.json?"+$id+"&photoid=1"});
	$("#imgGal2").attr({"src":"http://"+$api+"/artpleasenearby/getphoto.json?"+$id+"&photoid=2"});
	sessionStorage.GAL_SS_PHOTO1_COMMENT=data[0].GAL_SS_PHOTO1_COMMENT;
	sessionStorage.GAL_SS_PHOTO2_COMMENT=data[0].GAL_SS_PHOTO2_COMMENT;
	sessionStorage.GAL_SS_PHOTO3_COMMENT=data[0].GAL_SS_PHOTO3_COMMENT;
	sessionStorage.GAL_LAT=data[0].GAL_LAT;
	sessionStorage.GAL_LONG=data[0].GAL_LONG;
	
	$.mobile.loading( "hide" );
}

/*!
 * Populate lat and lng fields in settings page
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function initSettingsPage()
{
	if (sessionStorage.lat != null && sessionStorage.lat != "")
	{
		$("#currentLat").text(sessionStorage.lat);
		$("#currentLng").text(sessionStorage.lng);
	}
	else
	{
		sessionStorage.lat="45.783855";
		sessionStorage.lng="4.851521";
		$("#currentLat").text(sessionStorage.lat);
		$("#currentLng").text(sessionStorage.lng);
	}
}

/*!
 * Core Search Art Places code
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function searchartplaces()
{
	$($tableAPList[sessionStorage.currentPage]).empty();
	$($tableAPList[sessionStorage.currentPage]).hide();

	$.ajaxSetup({
		async: false
	});
	initBeforeSearch();
	getArtPlacesFromDatabase();
	getArtPlacesFromGooglePlace($nextGPToken);

	sessionStorage.searchdone = true;
	$.ajaxSetup({
		async: true
	});	
}

/*!
 * Search Art Places attached to an event
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function searchartplacesbyevent($eventidselected)
{
	$($tableAPList[sessionStorage.currentPage]).empty();
	$($tableAPList[sessionStorage.currentPage]).hide();

	$.ajaxSetup({
		async: false
	});
	initBeforeSearch();
	getArtPlacesAttachedToEvent($eventidselected);

	sessionStorage.searchartplaceattachedtoeventdone = true;
	$.ajaxSetup({
		async: true
	});	
}

/*!
 * Search Art Places around the center point of city
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function searchartplacesbycity()
{
	$.mobile.loading( 'show', {
	  text: "Searching...",
	  textVisible: true,
	  theme: "a",
	});	
	codeAddress();
}

/*!
 * Search Art Places around current location
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function searchartplacesbylocation()
{
	$.mobile.loading( 'show', {
	  text: "Searching...",
	  textVisible: true,
	  theme: "a",
	});	
	//console.log(sessionStorage.currentPage);
	searchartplaces();
}

/*!
 * Get data in order to update gallerydetail page with data from Art-PLease DB
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function updateArtPlaceDetailPage()
{


	if (sessionStorage.ap_type==1) //Artist => No Limit
	{
		$.ajax({
			type: "GET",
			url: "http://"+$api+"/artpleasenearby/mgetgallerydata.json?"+$id,
			cache: false,
			async: false,
			success : updateArtPlaceDetails
		});	
	}
	else //Gallery => Check subscriptions and show
	{
		$.ajax({
			type: "GET",
			url: "http://"+$api+"/artpleasenearby/mgetsubscriptions.json?"+$id,
			cache: false,
			async: false,
			success : function(datasubs){
				sessionStorage.currentSubscriptions = JSON.stringify(datasubs);
				$.ajax({
					type: "GET",
					url: "http://"+$api+"/artpleasenearby/mgetgallerydata.json?"+$id,
					cache: false,
					async: false,
					success : updateArtPlaceDetails,
					error : defaultArtPlaceDetailPage
				});
			},
			error : function(xhr){
				sessionStorage.currentSubscriptions = JSON.stringify(JSON.parse(xhr.responseText));
				$.ajax({
					type: "GET",
					url: "http://"+$api+"/artpleasenearby/mgetgallerydata.json?"+$id,
					cache: false,
					async: false,
					success : updateArtPlaceDetails,
					error : defaultArtPlaceDetailPage
				});						
			}					
		});					
	}
}

/*!
 * Show Direction text
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function showtext()
{
	$('#mapcanvas').css('display','none');
	$('#mapcanvas').css('visibility','hidden');
	$('#directions-panel').css('display','block');
	$('#directions-panel').css('visibility','visible');

}

/*!
 * Show Direction map
 *
 * dependancy: jQuery
 *
 * Date: 2013-10-17T14:32
 */
function showmap()
{
	$('#directions-panel').css('display','none');
	$('#directions-panel').css('visibility','hidden');
	$('#mapcanvas').css('display','block');
	$('#mapcanvas').css('visibility','visible');

}

/*!
 * Create the map form localisation to the gallery/artist
 *
 * dependancy: jQuery, Google Maps
 *
 * Date: 2013-10-17T14:32
 */
function initializeDirection() {

  var directionsDisplay;
  var directionsService = new google.maps.DirectionsService();

  directionsDisplay = new google.maps.DirectionsRenderer();
  var mapOptions = {
    zoom: 7,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: new google.maps.LatLng(sessionStorage.latOrigin, sessionStorage.lngOrigin)
  };
  var map = new google.maps.Map(document.getElementById('mapcanvas'),
      mapOptions);
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById('directions-panel'));

    var request = {
    origin: new google.maps.LatLng(sessionStorage.latOrigin, sessionStorage.lngOrigin),
	destination: sessionStorage.vicinity,
    travelMode: google.maps.TravelMode.WALKING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });
}

/*!
 * Get lat and lng for a given city
 *
 * dependancy: jQuery, Google Maps
 *
 * Date: 2013-10-17T14:32
 */
function codeAddress() 
{

	var address = document.getElementById("apcitysearch").value;
	
	$geocoder.geocode( { 'address': address}, function(results, status) {

	  if (status == google.maps.GeocoderStatus.OK) {
		var latlng = new google.maps.LatLng(results[0].geometry.location);
		sessionStorage.latOrigin = results[0].geometry.location.lat();
		sessionStorage.lngOrigin = results[0].geometry.location.lng();
		searchartplaces();
	  } else {
		alert("Geocode was not successful for the following reason: " + status);
		
	  }
	});
}

/*!
 * Collect click init GUA.
 *
 * dependancy: jQuery, Google Universal Analytics
 *
 * Date: 2013-10-17T14:32
 */
function initGA()
{
	var $clientId;

	if (typeof sessionStorage.deviceuuid != "undefined") {
	   $clientId=sessionStorage.deviceuuid;
	}
	else
	{
		$clientId='ffffffff-ffff-ffff-ffff-ffffffffffff';
	}
	$v='1';             // Version.
	$tid=$ga_id;  // Tracking ID / Web property / Property ID.
	$cid=$clientId;
	$sr=screen.width+'x'+screen.height;//screen resolution
	$vp=$(window).width()+"x"+$(window).height(); //viewport size
	$sd=screen.colorDepth; //screen color depth
	$ul=navigator.language; //user language
	$an='Art-Please Nearby';
	$av='1.0';

	$.ajax({
		type: "POST",
		url: "http://www.google-analytics.com/collect?",
		cache: false,
		data: {
			v:$v,
			tid:$tid,
			cid:$cid,
			t:'appview',
			an:$an,
			av:$av,
			cd:'home',
			sr:$sr,
			vp:$vp,
			sd:$sd,
			ul:$ul,
		},
	});
}

/*!
 * Collect click using GUA.
 *
 * dependancy: jQuery, Google Universal Analytics
 *
 * Date: 2013-10-17T14:32
 */
function trackclick($id,$metric,$dimension)
{
var $dim1="";
var $dim2="";
var $dim3="";
var $met1=0;
var $met2=0;
var $met3=0;
var $met4=0;
var $met5=0;
var $met6=0;
var $met7=0;
var $noninteraction = 0;
var $eventcat="";
var $eventaction="";
var $eventlabel="";

	$eventlabel=$dimension+" : "+$id+" - "+$metric;
	
	switch ($dimension)
	{
		case "gallery":
			  $dim1=$id;
			break;
			
		case "artist":
			  $dim2=$id;
			  
			break;
			
		case "event":
			  $dim3=$id;
			  
			break;
	}
	$eventcat=$metric;
	switch ($metric)
	{
		case "vlist":
			  
			  $eventaction="listed";
			  $noninteraction=1;
			  $met1=1;
			break;
			
		case "vdetail":
			  $eventaction="clicked";
			  $noninteraction=0;
			  $met2=1;
			break;
		case "tel":
			  $eventaction="clicked";
			  $noninteraction=0;
			  $met3=1;
			break;
			
		case "url":
			  $eventaction="clicked";
			  $noninteraction=0;
			  $met4=1;
			break;
			
		case "ss":
			  $eventaction="clicked";
			  $noninteraction=0;
			  $met5=1;
			break;

		case "evlist":
			  $eventaction="listed";
			  $noninteraction=0;
			  $met6=1;
			break;
			
		case "shared":
			  $eventaction="clicked";
			  $noninteraction=0;
			  $met7=1;
			break;
			
	}
	

	$.ajax({
		type: "POST",
		url: "http://www.google-analytics.com/collect?",
		cache: false,
		data: {
			v:$v,
			tid:$tid,
			cid:$cid,
			sr:$sr,
			vp:$vp,
			sd:$sd,
			ul:$ul,
			t:'event',
			ni:$noninteraction,
			ec:$eventcat,
			ea:$eventaction,
			el:$eventlabel,
			ev:1,
			cd1: $dim1,
			cd2: $dim2,
			cd3: $dim3,
			cm1 : $met1,
			cm2 : $met2,
			cm3 : $met3,
			cm4 : $met4,
			cm5 : $met5,
			cm6 : $met6,
			cm7 : $met7,
		},
		success : function(){

			},
		error: function(){

			}
	});
}

/*!
 * Collect page view using GUA.
 *
 * dependancy: jQuery, Google Universal Analytics
 *
 * Date: 2013-10-17T14:32
 */
function googleanalyticsCall($page)
{
	$.ajax({
		type: "POST",
		url: "http://www.google-analytics.com/collect?",
		cache: false,
		data: {
			v:$v,
			tid:$tid,
			cid:$cid,
			t:'pageview',			
			dh:'nearby.art-please.com',
			dp:$page,
			sr:$sr,
			vp:$vp,
			sd:$sd,
			ul:$ul,		},
	});	  
	  
}

/*!
 * Share a msg from Art-PLease Nearby (email, FB, Twitter, G+, ...).
 *
 * dependancy: jQuery, SocialMessage Cordova plugin (https://github.com/leecrossley/cordova-plugin-social-message)
 *
 * Date: 2013-10-17T14:32
 */
 
function sendmsg()
{
var $url ="";
var $msg = "";
$type = "";

	$platform = sessionStorage.platform;
			
	if (sessionStorage.ap_type=="1")
	{
		$type = "artist";
		trackclick(sessionStorage.name+'-'+sessionStorage.id,'shared','artist');
	}
	else
	{
		$type = "gallery";
		trackclick(sessionStorage.name+'-'+sessionStorage.id,'shared','gallery');
	}
	
	$msg = "Found this fantastic "+$type+" on Art-Please nearby app: "+sessionStorage.name+", "+sessionStorage.vicinity;
	
	switch ($platform)
	{
	case "Android":
		$url="http://www.art-please.com/googleplay";
		$continue=true;
		break;
	
	case "iOS":
		$continue=true;
		$url="http://www.art-please.com/appstore";
		break;
	
	default:
		$continue=false;
		break;
	}
	
	if ($continue)
	{
		var message = {
			text: $msg,
			url: $url
		};
		window.socialmessage.send(message);
	}
}

$(document).on("mobileinit", function(){

	$( document ).on( "pageinit", function( event, ui ) {
		sessionStorage.currentPage=event.target.id;
		if (sessionStorage.currentPage=="PageSettings")
		{
			
		}
	
	});

	$(document).on("pagecontainertransition", function (e, ui) {
		//Note : Because I get the current page id using this event. You must use transition in ALL pages call in order to be
		//sure to record the page id
		sessionStorage.currentPage=ui.toPage[0].id;
	});

	$(document).on( "pagecontainershow", function( event, ui ) {

		initGA(); //I place initGA here to be sure var being initialized even if user click on tel or url link in PageDetail
		
		//if (event.target.id=="PageIndex")
		if(sessionStorage.currentPage=="PageIndex")
		{
			//sessionStorage.currentPage=event.target.id;
			
			if (sessionStorage.lat == null || sessionStorage.lat == "")
			{
				initialize();
			}

			$("#currentLng").val(sessionStorage.radius);
		}

		if (sessionStorage.currentPage=="PageSettings")
		{
			//sessionStorage.currentPage=event.target.id;
			initSettingsPage();
		}		

		if (sessionStorage.currentPage=="artPlaceSearch")
		{
			$tableAPList[sessionStorage.currentPage]="#ASartplacelist";
		}
		
		if (sessionStorage.currentPage=="PageArtPlaceList")
		{
			//sessionStorage.currentPage=event.target.id;
			$tableAPList[sessionStorage.currentPage]="#artplacelist";
			
			if (sessionStorage.searchdone == null || sessionStorage.searchdone == "")
			{
				sessionStorage.latOrigin = sessionStorage.lat;
				sessionStorage.lngOrigin = sessionStorage.lng;
				$.mobile.loading( 'show', {
				  text: "Searching...",
				  textVisible: true,
				  theme: "a",
				});					
				searchartplaces();
			}
			else
			{
				sessionStorage.latOrigin = sessionStorage.lat;
				sessionStorage.lngOrigin = sessionStorage.lng;
				$("#clearandsearch").css('display','block');	
				$("#clearandsearch").css('visibility','visible');	
			}
		}		

		if (sessionStorage.currentPage=="PageArtPlaceEventList")
		{
			//sessionStorage.currentPage=event.target.id;
			$tableAPList[sessionStorage.currentPage]="#artplaceeventlist";
			
			
			if (sessionStorage.searchartplaceattachedtoeventdone == null || sessionStorage.searchartplaceattachedtoeventdone == "")
			{
				sessionStorage.latOrigin = sessionStorage.lat;
				sessionStorage.lngOrigin = sessionStorage.lng;
				$.mobile.loading( 'show', {
				  text: "Searching...",
				  textVisible: true,
				  theme: "a",
				});					
				searchartplacesbyevent(sessionStorage.eventid);
			}
			else
			{
				sessionStorage.latOrigin = sessionStorage.lat;
				sessionStorage.lngOrigin = sessionStorage.lng;
			}
		}				
		
		if (sessionStorage.currentPage=="artPlaceDetails")
		{
			$.mobile.loading( 'show', {
			  text: "Updating...",
			  textVisible: true,
			  theme: "a",
			});
			
			//sessionStorage.currentPage=event.target.id;
			if (sessionStorage.gal_id=='true')
				$id = "galid="+sessionStorage.id;
			else
				$id = "googleid="+sessionStorage.id;
				
			$prepend = "";
			updateArtPlaceDetailPage();
		}

		if (sessionStorage.currentPage=="artPlaceDirections")
		{
			//sessionStorage.currentPage=event.target.id;
			initializeDirection();
		}

		if (sessionStorage.currentPage=="PageEventList")
		{
			$.mobile.loading( 'show');
			$tableEventsList[sessionStorage.currentPage]="#eventlist";
			searchevents();
		}

		if (sessionStorage.currentPage=="PageSearchEventList")
		{
			$tableEventsList[sessionStorage.currentPage]="#eventsearchedlist";
		}

		if (sessionStorage.currentPage=="eventdetails")
		{
			if (ui.prevPage[0].id=="PageEventList")
				$("#eventdetailbackbutton").attr('href','#PageEventList');
			else
				$("#eventdetailbackbutton").attr('href','#PageSearchEventList');
			$("#logoevent").attr('src','http://'+$api+'/artpleasenearby/geteventlogo.json?eventid='+sessionStorage.eventid)
			$('#eventdate').html(sessionStorage.eventstartdate+" - "+sessionStorage.eventenddate);
			$('#eventname').html(sessionStorage.eventname);
			$('#eventdesc').html(sessionStorage.eventdesc);
			$('#eventaddress').html(sessionStorage.eventaddress);
		}
		
		
		if (sessionStorage.currentPage=="artPlaceSlideshow" || sessionStorage.currentPage=="martPlaceSlideshow" )
		{
			//sessionStorage.currentPage=event.target.id;
			$("#ssimg1").attr({"data-src":"http://"+$api+"/artpleasenearby/getphoto.json?"+$id+"&photoid=3"});
			$("#ssimg2").attr({"data-src":"http://"+$api+"/artpleasenearby/getphoto.json?"+$id+"&photoid=4"});	
			$("#ssimg3").attr({"data-src":"http://"+$api+"/artpleasenearby/getphoto.json?"+$id+"&photoid=5"});	
			
			if (sessionStorage.GAL_SS_PHOTO1_COMMENT!='null')
				$("#commentimg1").html(sessionStorage.GAL_SS_PHOTO1_COMMENT);

			if (sessionStorage.GAL_SS_PHOTO2_COMMENT!='null')
				$("#commentimg2").html(sessionStorage.GAL_SS_PHOTO2_COMMENT);	
				
			if (sessionStorage.GAL_SS_PHOTO3_COMMENT!='null')
				$("#commentimg3").html(sessionStorage.GAL_SS_PHOTO3_COMMENT);
			
			// camera js and its dependencies have to be loaded in every pages. If you don't do that you could have a $(..).camera is
			//not a function due to a weird $ removal from the DOM
			 $('#camera_wrap_1').camera({
				height: '35%',
				thumbnails: false,
				loader: 'none',
				portrait: true
				
			});
		}

		/*
		*
		*
		*Only for website usage
		*
		*/
		if (sessionStorage.currentPage=="martPlaceDetails")
		{
			sessionStorage.id = getUrlVars()["id"];
			sessionStorage.name = decodeURI(getUrlVars()["galname"]);
			$id = "galid="+sessionStorage.id;
			$prepend = "m";
			updateArtPlaceDetailPage();
		
		}		
		//********************************************************************

		googleanalyticsCall('/'+sessionStorage.currentPage);
	});
});
