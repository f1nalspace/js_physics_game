<?php
	require_once 'JShrink.class.php';

    function endsWith($haystack, $needle)
    {
        return $needle === "" || substr($haystack, -strlen($needle)) === $needle;
    }

    function addJSFilesFromDir($dir, &$files) {
        if ($handle = opendir($dir)) {
            while (false !== ($file = readdir($handle))) {
                if ($file != "." && $file != "..") {
                    if (endsWith($file, '.js')) {
                        $files[] = $dir . "/" . $file;
                    } else if (is_dir($dir . "/" . $file)) {
                        addJSFilesFromDir($dir . "/" . $file, $files);
                    }
                }
            }
        }
    }

    function parseJSDeps($file) {
        $res = array(
            'req' => array(),
            'def' => array(),
        );

        $handle = @fopen($file, "r");
        if ($handle) {
            while (($buffer = fgets($handle, 4096)) !== false) {
                $reqs = array();
                if (preg_match('/fm\.req\(\"([0-9a-zA-Z\.]+)\"\)/', $buffer, $reqs) === 1) {
                    $res['req'][$reqs[1]] = $reqs[1];
                } else if (preg_match('/fm\.ns\(\"([0-9a-zA-Z\.]+)\"\)/', $buffer, $reqs) === 1) {
                    $res['def'][$reqs[1]] = $reqs[1];
                //} else if (preg_match('/(fm\.[0-9a-zA-Z\._]+)\s+?\=\s+?(new|function|\{|\()/', $buffer, $reqs) === 1) {
                    //$res['def'][$reqs[1]] = $reqs[1];
                //} else if (preg_match('/var\s+(fm)\s+?\=\s+?\{\}\;/', $buffer, $reqs) === 1) {
                    //$res['def'][$reqs[1]] = $reqs[1];
                }
            }
            fclose($handle);
        }
        return $res;
    }

    function recursiveDependencies($items) {

        function createUnknownDeps(&$items) {
            foreach ($items as $itemKey => $item) {
                foreach ($item as $subKey => $subitem) {
                    if (!array_key_exists($subitem, $items) && !array_key_exists($subitem, $unknown)) {
                        $items[$subitem] = array();
                    }
                }
            }
        }

        // First off - create unknown deps
        createUnknownDeps($items);

        function depends($items, $sorted, $name) {
            foreach ($items[$name] as $itemKey => $item) {
                if (!isset($sorted[$item])) return depends($items,$sorted,$item); // Recursive, find the first unmet dependency
            }
            return $name;
        }

        // Create sorted array
        $sorted = array();
        foreach ($items as $name=>$void) {
            do {
                $depends = depends($items,$sorted,$name);
                $sorted[$depends] = $items[$depends];
            } while ($depends != $name); // keep going until all the dependencies are met
        }

        return $sorted;
    }

    function generateJSDependencies($files) {
        $deps = array();
        foreach ($files as $fileKey => $file) {
            $deps[$file] = parseJSDeps($file);
        }
        function findDepFile($deps, $name) {
            foreach ($deps as $k => $v) {
                if (array_key_exists($name, $v['def'])) {
                    return $k;
                }
            }
            return null;
        }
        $depFiles = array();
        foreach ($deps as $file => $dep) {
            $depFiles[$file] = array();
            foreach ($dep['req'] as $reqKey => $req) {
                $depFile = findDepFile($deps, $reqKey);
                if ($depFile == null) {
                    throw new Exception("Required dependency '$reqKey' for '$file' not found!");
                }
                $depFiles[$file][$depFile] = $depFile;
            }
        }
        return recursiveDependencies($depFiles);
    }

    $enginePath = "../fm";
    $sourcePath = "../platformer";
    $targetPath = "../";

    $releaseFile = $targetPath . "platformer-built.js";

    // Built complete file list
    $files = array();
    addJSFilesFromDir($enginePath, $files);
    addJSFilesFromDir($sourcePath, $files);
    /*
    $files = array_filter($files, function($x) {
        return strpos($x,'entity.') != 0;
    });
    */

    // Generate dependency sorted file list
    print("Generate dependency tree from ".count($files)." source files.\n");
    $depList = array();
    try {
        $depList = generateJSDependencies($files);
    } catch (Exception $e) {
        print($e->getMessage() . "\n");
    }

    // Generate source files array
    $sourceFiles = array();
    foreach ($depList as $depFile => $depValue) {
        array_push($sourceFiles, $depFile);
    }

    // Put source files into one single release file
    if (count($sourceFiles) > 0) {
        print("Generate release file '".$releaseFile."' for ".count($sourceFiles)." source files.\n");
        $s = '';
        foreach ($sourceFiles as $fileKey => $file) {
            $content = file_get_contents($file);
            $s .= JShrink::minify($content);
            $s = str_replace("}\n", "}", $s);
        }
        file_put_contents($releaseFile, $s);
        print("Successfully created built file '".$releaseFile."' for ".count($sourceFiles)." source files\n");
    }
?>