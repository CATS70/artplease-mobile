<?php
//load httpresponse code
require_once "httpresponsecode.php";

//get latitude and longitude
$url=$_GET['url'];


// jSON URL which should be requested
$json_url = $url;
 
// jSON String for request
// $json_string = "?lat=$latitude&long=$longitude&radius=1000&sensor=false&types=art_gallery&key=$google_api_key&api_url=$google_api_url";
 
// Initializing curl
$ch = curl_init( $json_url );

$header[0] = "Accept: text/xml,application/xml,application/xhtml+xml,";
$header[0] .= "text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5";
$header[] = "Cache-Control: max-age=0";
$header[] = "Connection: keep-alive";
$header[] = "Keep-Alive: 300";
$header[] = "Accept-Charset: utf-8";
$header[] = "Accept-Language: fr"; // Langue fr
$header[] = "Content-type: application/json"; // Simule un navigateur
$header[] = "Pragma: "; // Simule un navigateur
$useragent = 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0'; // Pour se faire passer pour Firefox

 
// Setting curl options
//curl_setopt($ch,CURLOPT_FAILONERROR,true);

//curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
//curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: application/json'));
// curl_setopt($ch, CURLOPT_USERAGENT, $useragent);
if (file_exists("C:/www.art-please.org/www.art-please.org/android/assets/www/php/cert/cacert.pem"))
	curl_setopt ($ch, CURLOPT_CAINFO, "C:/www.art-please.org/www.art-please.org/android/assets/www/php/cert/cacert.pem"); 
else
	curl_setopt ($ch, CURLOPT_CAINFO, "D:/www.art-please.org/android/assets/www/php/cert/cacert.pem"); 
// Getting results
$result = curl_exec($ch); // Getting jSON result string
// error_log(curl_error($ch));
// error_log($json_url);
// error_log($result);
curl_close($ch);
if (!empty($result))
	echo $result;
else
{
	header(HTTPStatus(404)['error']);
	echo $result;
}
	


?>