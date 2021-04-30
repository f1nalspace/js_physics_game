<?php
    header("Pragma: public");
    header("Expires: 0");
    header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
    header("Cache-Control: private", false);
    header("Content-Type: application/json");

	//$contentPath = dirname(dirname($_SERVER['SCRIPT_FILENAME'])) . "/content";
	$contentPath = realpath("../content");
	$mapsPath = $contentPath . "/maps";

    $action = isset($_POST['action']) ? $_POST['action'] : (isset($_GET['action']) ? $_GET['action'] : null);
    $map = isset($_POST['map']) ? $_POST['map'] : (isset($_GET['map']) ? $_GET['map'] : null);
    $data = isset($_POST['data']) ? $_POST['data'] : null;
	if ("list" === $action) {
	    $list = array();
        if ($handle = opendir($mapsPath)) {
            while (($file = readdir($handle)) !== false) {
                if ($file != "." && $file != "..") {
                    $list[] = $file;
                }
            }
            closedir($handle);
        }
        print json_encode($list);
	} else if ("load" === $action) {
	    if (!isset($map)) throw new Exception("Map required!");
        $mapFile = $mapsPath . "/" . $map;
	    header("Content-Length: ".@filesize($mapFile));
	    @readfile($mapFile) or die("Map '".$mapFile."' could not be found!");
	} else if ("save" === $action && $map !== null && $data !== null) {
	    if (!isset($map)) throw new Exception("Map required!");
        $mapFile = $mapsPath . "/" . $map;
        @file_put_contents($mapFile, $data);
        print('{"status": "success"}');
	} else {
	    throw new Exception("Invalid action!");
	}
?>