<?php

function _scanFolder ($dir)
{
	global $_home;
	$dir = $_home . $dir;
	
    $dirs = array_diff(scandir($dir), array(".", ".."));

    $dirArray = array();

    foreach ($dirs as $key => $d)
	{
		$dirArray[$key]['name'] = utf8_encode($d);
		$dirArray[$key]['path'] = utf8_encode(str_replace($_home, '', $dir));
		
        if (is_dir($dir."/".$d))
			$dirArray[$key]['type'] = 'dir';
        
		else 
			$dirArray[$key]['type'] = 'file';
    }
    
	return $dirArray;
}


function _getFilename ($file)
{
	$file = strrchr($file, '/');
	
	return str_replace('/', '', $file);
}

function _moveObject ($file, $dest)
{
	global $_home;
	
	$filename = _getFilename($file);
	
	return rename($_home . $file, $_home . $dest .'/'. $filename);
}

function wlog ($data, $dec = 1, $keyName = 'Data')
{
	$file = 'log/log.txt';
	$output = '';
	
	if (is_array($data))
	{
		$len = count($data);
		$output .= str_repeat("\t", $dec - 1);
		$output .= $keyName . " (Array) => \n";
		
		foreach ($data as $k => $d)
		{
			if (is_array($d))
				$output .= wlog($d, $dec + 1, $k);
			
			else
			{
				$output .= str_repeat("\t", $dec);
				$output .= $k . ' => ' . $d . "\n";
			}
		}
	}
	
	else
		$output = $data . "\n";
		
	if ($dec == 1)
		file_put_contents($file, $output . "\n", FILE_APPEND);
		
	else
		return $output;
}


?>