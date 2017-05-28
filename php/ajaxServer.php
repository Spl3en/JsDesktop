<?php

include_once('server.php');

function main ($data)
{
	$allowedFunctions = array (
		'scanFolder',
		'moveObject'
	);

	$func = $data['funcName'];

	unset($data['funcName']);

	if (!in_array($func, $allowedFunctions))
		return;

	$arglen = count($data);
	$call = '';
	
	for ($i = 0; $i < $arglen; $i++)
	{
		$call .= '$data["arg'.($i+1).'"]';
		
		if ($i != $arglen - 1)
			$call .= ',';
	}
	
	$call = '$func(' . $call . ');';
	
	$regex = '/^\$func\((\$data\["arg[0-9]+"\],?)*\);$/';
	
	if (!preg_match($regex, $call))
		return;
		
	eval($call);
}

if (!empty($_POST))
	main($_POST);