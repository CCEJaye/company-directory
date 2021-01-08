<?php


// REQUEST
// "type" => query name,
// "params" => [
// 	"0" => [
// 		"param1" => ,
// 		"param2" =>
// 	],
// 	"1" => [
// 		"param1" => ,
// 		"param2" =>
// 	]
// ]

// GET ALL PERSONNEL
// cd.php?type=allPersonnel
// GET 10 PERSONNEL FROM 21 to 30
// cd.php?type=somePersonnel&params[0][limit]=10&params[0][offset]=20
// GET PERSONNEL 2 AND 4
// cd.php?type=getPersonnel&params[0][id]=2&params[1][id]=4

// RESPONSE
// "status" => [
// 	"code" => ,
// 	"description" => ,
// 	"took" =>
// ],
// "data" => [
// 	"success" => ,
// 	"results" => [
// 		"0" => [
// 			row1,
// 			row2
// 		]
// 	]
// ]


session_set_cookie_params([
	"lifetime" => 60,
	"path" => "/company-directory/",
	"domain" => "charlesjaye.uk",
	"secure" => true,
	"httponly" => true,
	"samesite" => Strict
]);
session_start();

ini_set('display_errors', 'On');
error_reporting(E_ALL);

require __DIR__ . "/util.php";
require __DIR__ . "/statements.php";
require __DIR__ . "/config.php";

$startTime = microtime(true);
$isGet = array_key_exists("type", $_GET) ? true : false;
$params = $isGet ? $_GET : $_POST;
$requestType = $params["type"];
$opts = getStatementOptions($isGet ? "get" : "post", $requestType);

if (!$opts)
{
	error_log("Invalid request type");
	respond("400", "Invalid request type", $startTime);
	return;
}

try
{
	$pdo = new PDO("mysql:host={$cdHost};dbname={$cdDatabase}", $cdUser, $cdPassword,
		[ PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION ]);
} catch(PDOException $error)
{
	error_log("Database unreachable");
	error_log($error->getMessage());
	respond("500", "Database unreachable", $startTime);
	return;
}

try
{
	$sth = $pdo->prepare($opts["sql"]);
	
	if (isset($params["params"]))
	{
		for ($i = 0; $i < count($params["params"]); $i++) { 
			bind_values($sth, $opts, $params["params"][$i]);
			$output[$i]["success"] = $sth->execute();
			if (!$isGet || ($sth->rowCount() <= 0)) continue;
			while ($row = $sth->fetch(PDO::FETCH_ASSOC, PDO::FETCH_ORI_NEXT))
			{
				$output[$i]["results"][] = $row;
			}
		}
	} else
	{
		$output[0]["success"] = $sth->execute();
		if (!$isGet || ($sth->rowCount() <= 0)) return;
		while ($row = $sth->fetch(PDO::FETCH_ASSOC, PDO::FETCH_ORI_NEXT))
		{
			$output[0]["results"][] = $row;
		}
	}
} catch(PDOException $error)
{
	error_log("Invalid request params");
	error_log($error->getMessage());
	respond("400", "Invalid request params", $startTime, $output);
	return;
}

// if any queries fail
if (array_reduce($output, function($carry, $i) { return $carry || !$i["success"]; }))
{
	error_log("Request failed");
	respond("400", "Request failed", $startTime, $output);
	return;
}

respond("200", $requestType . " success", $startTime, $output);

?>