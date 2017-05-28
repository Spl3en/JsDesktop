<?php

include_once('config.php');
include_once('fileFunctions.php');
include_once('secFunctions.php');

function scanFolder ($dir)
{	
	if (isDirectoryTraversal($dir))
	{
		echo json_encode(array());
		return;
	}

	$var = utf8_decode(json_encode(_scanFolder($dir)));
	echo $var;
	return;
}


function moveObject ($file, $dest)
{
	if (isDirectoryTraversal($file) || isDirectoryTraversal($dest))
	{
		echo json_encode(array());
		return;
	}
	
	$var = utf8_decode(json_encode(_moveObject($file, $dest)));
	echo $var;
	
	return;
}

?>