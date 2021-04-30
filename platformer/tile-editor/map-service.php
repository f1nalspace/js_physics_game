<?php
$saveDirs = array('../content/maps/', 'D:/webprojects/platformer/content/maps/', '/home/tspaete/workspaces/platformer/content/maps');
$action = $_POST['action'];
if ($action === 'save') {
	$name = $_POST['name'];
	$data = $_POST['data'];
	foreach($devDirs as $dirKey => $dir) {
        if (file_exists($dir)) {
            file_put_contents($dir.$name.'.json', $data);
        }
	}
} else if ($action === 'load') {
	$name = $_POST['name'];
	readfile($dir.$name.'.json');
} else if ($action === 'list') {
	if ($handle = opendir($dir)) {
		$resp = array();
		while (false !== ($file = readdir($handle))) {
		    if (!is_dir($file)) {
		    	$resp[] = str_replace('.json', '', $file);
		    }
		}
		closedir($handle);
		
		echo implode(',', $resp);
	}
}
