<?php


function isDirectoryTraversal ($path) 
{
	global $_home;
	
	// On v�rifie que le chemin ne contient pas de '..'
	// Inconv�nient : banni les fichiers dont le nom comporte ces caract�res
	if (strpos($path, '..') !== false) {
		return true;
	}
		
	// On v�rifie que le chemin commence par $_home (check parano)
	if (strpos($path, $_home)) {
		return true;
	}
	
	
	return false;
}




?>