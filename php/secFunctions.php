<?php


function isDirectoryTraversal ($path) 
{
	global $_home;
	
	// On vérifie que le chemin ne contient pas de '..'
	// Inconvénient : banni les fichiers dont le nom comporte ces caractères
	if (strpos($path, '..') !== false) {
		return true;
	}
		
	// On vérifie que le chemin commence par $_home (check parano)
	if (strpos($path, $_home)) {
		return true;
	}
	
	
	return false;
}




?>