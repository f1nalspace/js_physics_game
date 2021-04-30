package fs.corejs;

import java.io.File;
import java.io.FileReader;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.List;

import javax.script.Bindings;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

public class CoreJS {
	private final String[] deps = new String[] {
			"/require.js",
			"/estraverse.js",
			"/esprima.js",
			"/esmangle.js",
			"/esutils/ast.js",
			"/esutils/code.js",
			"/escodegen.js",
			"/browser.js",
	};

	public static void main(String[] args) throws Exception {
		CoreJS app = new CoreJS();
		app.build(args);
	}


	private String pathToJs(File path) {
		return path.getAbsolutePath().replace("\\", "/");
	}
	
	private Object toJava(final Object obj) {
	    if (obj instanceof Bindings) {
	        try {
	            final Class<?> cls = Class.forName("jdk.nashorn.api.scripting.ScriptObjectMirror");
	            if (cls.isAssignableFrom(obj.getClass())) {
	                final Method isArray = cls.getMethod("isArray");
	                final Object result = isArray.invoke(obj);
	                if (result != null && result.equals(true)) {
	                    final Method values = cls.getMethod("values");
	                    final Object vals = values.invoke(obj);
	                    if (vals instanceof Collection<?>) {
	                        final Collection<?> coll = (Collection<?>) vals;
	                        return coll.toArray(new Object[0]);
	                    }
	                }
	            }
	        } catch (ClassNotFoundException | NoSuchMethodException | SecurityException
	                | IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {}
	    }
	    if (obj instanceof List<?>) {
	        final List<?> list = (List<?>) obj;
	        return list.toArray(new Object[0]);
	    }
	    return obj;
	}
	
	private String generateHTML(String scriptFile, String appName, String appVersion, String appNamespace, String appClass) {
		StringBuilder s = new StringBuilder();
		s.append("<!DOCTYPE html>\n");
		s.append("<html>\n");
		s.append("<head>\n");
		s.append("<title>"+escapeHTML(appName)+" - v"+escapeHTML(appVersion)+"</title>\n");
		s.append("<meta charset=\"utf-8\">\n");
		s.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\">\n");
		s.append("<style type=\"text/css\">\n");
		s.append("* {\n");
		s.append("margin: 0;\n");
		s.append("padding: 0;\n");
		s.append("}\n");
		s.append("body {\n");
		s.append("background: black;\n");
		s.append("margin: 0;\n");
		s.append("padding: 0;\n");
		s.append("overflow: hidden;\n");
		s.append("}\n");
		s.append("canvas {\n");
		s.append("display: block;\n");
		s.append("}\n");
		s.append("canvas:focus {\n");
		s.append("outline:none;\n");
		s.append("}\n");
		s.append("</style>\n");
		s.append("</head>\n");
		s.append("<body>\n");
		s.append("<canvas id=\"canvas\" width=\"1280\" height=\"720\" tabindex=\"1\"></canvas>\n");
		s.append("<script type=\"text/javascript\" src=\""+scriptFile+"\"></script>\n");
		s.append("<script type=\"text/javascript\">\n");
		s.append("final.setLogLevel(final.LogLevel.Debug);\n");
		s.append("final.load('"+appNamespace+"', function(){\n");
		s.append("new "+appNamespace+"."+appClass+"('canvas').run();\n");
		s.append("});\n");
		s.append("</script\n");
		s.append("</body>\n");
		s.append("</html>\n");
		return s.toString();
	}
	

	private String escapeHTML(String s) {
	    StringBuilder out = new StringBuilder(Math.max(16, s.length()));
	    for (int i = 0; i < s.length(); i++) {
	        char c = s.charAt(i);
	        if (c > 127 || c == '"' || c == '<' || c == '>' || c == '&') {
	            out.append("&#");
	            out.append((int) c);
	            out.append(';');
	        } else {
	            out.append(c);
	        }
	    }
	    return out.toString();
	}
	
	public void build(String[] args) throws Exception {
		if (args.length < 1) {
			System.err.println("Build manifest is missing!");
			return;
		}
		File manifestFile = new File(args[0]);
		if (!manifestFile.exists()) {
			System.err.println("Build manifest file '"+args[0]+"' does not exists!");
			return;
		}
		File appPath = manifestFile.getAbsoluteFile().getParentFile();

		// TODO: Read from app manifest file
		String manifestAppName = "Towadev";
		String manifestAppNamespace = "final.towadev";
		String manifestAppClass = "TowaDev";
		String manifestAppAssetsFolder = "content";
		String manifestAppVersion = "0.5-alpha";
		boolean mangle = true;
		boolean optimize = true;
		boolean minify = true;
				
		// Get js script engine
		ScriptEngineManager engineMng = new ScriptEngineManager(); 
		ScriptEngine engine = engineMng.getEngineByName("nashorn");
		if (engine == null) {
			engine = engineMng.getEngineByName("JavaScript");
		}
		if (engine == null) {
			System.err.println("No javascript engine found!");
			return;
		}
		
		// Load dependencies (esprima)
		for (String lib: deps) {
			System.out.println("Load dependency: " + lib);
			engine.eval(FileUtils.readStream(getClass().getResourceAsStream(lib)));
		}
				
		// Load module system
		File moduleSystemFile = new File(appPath, "final/core.js");
		String moduleSystemFilePath = pathToJs(moduleSystemFile);
		System.out.println("Load module system: " + moduleSystemFilePath);
		engine.eval(new FileReader(moduleSystemFile));
		
		// Change load type to load and set log level to debug
		engine.eval("window.final.setLoadType('load');");
		engine.eval("window.final.setLogLevel(window.final.LogLevel.Debug);");
		
		// TODO: Make this parameterizable
		File finalPath = new File(appPath, "final");
		File sourcePath = new File(appPath, "source");
		engine.eval("window.final.addSourcePath('"+pathToJs(finalPath)+"/', '^(final\\..*)$', false, 'final')");
		engine.eval("window.final.addSourcePath('"+pathToJs(sourcePath)+"/', '^(final\\.towadev)$', true, 'final')");
		engine.eval("window.final.addSourcePath('"+pathToJs(sourcePath)+"/', '^(final\\.towadev\\..*)$', true, 'final')");
		engine.eval("window.final.load('"+manifestAppNamespace+"', null, null, true);");

		// Get installed module filenames
		Object[] installedModules = (Object[]) toJava(engine.eval("window.final.getInstalledModules();"));
		String[] installedModuleFilenames = new String[installedModules.length];
		String appModuleVersion = "0.0";
		for (int i = 0; i < installedModules.length; i++) {
			Bindings module = (Bindings) installedModules[i];
			String name = (String) module.get("name");
			installedModuleFilenames[i] = (String) module.get("filename");
			if (manifestAppNamespace.equals(name)) {
				appModuleVersion = (String) module.get("version");
			}
		}
		
		// Compare module version with manifest version
		if (!manifestAppVersion.equals(appModuleVersion)) {
			System.err.println("Version mismatch in manifest: '"+manifestAppVersion+"' vs '"+appModuleVersion+"'");
			System.err.println("Module and manifest version must be equals!");
			return;
		}

		// Build module sources (Append module system first)
		StringBuilder moduleSources = new StringBuilder();
		moduleSources.append(FileUtils.readFile(moduleSystemFile));
		for (int i = 0; i < installedModuleFilenames.length; i++) {
			String moduleFilename = installedModuleFilenames[i];
			System.out.println("Adding module: " + moduleFilename);
			moduleSources.append(FileUtils.readFile(new File(moduleFilename)));
		}

		// Transform sources
		engine.put("curSource", moduleSources.toString());
		System.out.println("Parse sources");
		engine.eval("var ast = esprima.parse(curSource);");
		if (optimize) {
			System.out.println("Optimize sources");
			engine.eval("var optimized = esmangle.optimize(ast, null);");
			engine.eval("ast = optimized;");
		}
		if (mangle) {
			System.out.println("Mangle sources");
			engine.eval("var mangled = esmangle.mangle(ast);");
			engine.eval("ast = mangled;");
		}
		System.out.println("Generate sources");
		StringBuffer options = new StringBuffer();
		options.append("{");
		options.append("format: {");
		options.append("renumber: true,");
		options.append("hexadecimal: true,");
		options.append("escapeless: true,");
		options.append("compact: true,");
		options.append("semicolons: true,");	
		options.append("parentheses: true");
		options.append("}");
		options.append("}");
		String output;
		if (minify) {
			output = (String) engine.eval("escodegen.generate(ast, "+options.toString()+");");
		} else {
			output = (String) engine.eval("escodegen.generate(ast, null);");
		}
		
		// Enforce clean build dir
		File buildDir = new File(appPath, "build");
		if (buildDir.exists()) {
			FileUtils.deleteDirectory(buildDir);
		}
		buildDir.mkdirs();

		// Write js source
		String appFileName = FileUtils.cleanFilename(manifestAppName).toLowerCase() + "-"+manifestAppVersion+".js";
		File appJsFile = new File(buildDir, appFileName);
		System.out.println("Write out sources to: " + appJsFile);
		FileUtils.writeFile(appJsFile, output);
		
		// Write index source
		File appHtmlFile = new File(buildDir, "index.html");
		System.out.println("Generate HTML Index to : " + appHtmlFile);
		String indexHtml = generateHTML(appFileName, manifestAppName, manifestAppVersion, manifestAppNamespace, manifestAppClass);
		FileUtils.writeFile(appHtmlFile, indexHtml);
		
		// Write assets
		File appAssetsSourceDir = new File(appPath, manifestAppAssetsFolder);
		File assetsDir = new File(buildDir, appAssetsSourceDir.getName());
		System.out.println("Write assets from '"+appAssetsSourceDir+"' to: " + assetsDir);
		assetsDir.mkdir();
		FileUtils.copyDirectory(appAssetsSourceDir, assetsDir);
		
		System.out.println("Done");
	}
}
