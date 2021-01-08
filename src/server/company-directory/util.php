<?php

function is_assoc($arr)
{
    if (!is_array($arr)) return false;
    foreach ($arr as $key => $value)
    {
        if (is_string($key)) return true;
    }
    return false; 
}

function respond($code = "", $description = "", $startTime, $data = [])
{
	http_response_code($code);
	echo json_encode([
		"status" => [
			"code" => $code,
			"description" => $description,
			"took" => (microtime(true) - $startTime) * 1000 . "ms"
		],
		"data" => $data
	]);
}

function bind_values($sth, $opts, $values)
{
	foreach ($opts["params"] as $i => $param)
	{
		$sth->bindValue(":{$param}", $values[$param], $opts["types"][$i]);
	}
}

?>