package de.finaljs;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.apache.commons.cli.BasicParser;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.OptionBuilder;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.io.filefilter.IOFileFilter;

import uglify.UglifyJS;

public class Builder {
	
	private static final String ARG_OUT = "o";
	private static final String ARG_FW = "fw";
	private static final String ARG_IN = "i";
	
	private final File frameworkPath;
	private final String[] sourceFiles;
	private final File outputPath;
	
	public Builder(final File frameworkPath, final String[] sourceFiles, final File outputPath){
		this.frameworkPath = frameworkPath;
		this.sourceFiles = sourceFiles;
		this.outputPath = outputPath;
	}
	
	public void create() throws IOException{
		File coreFile = new File(frameworkPath, "core.js");
		
		System.out.println("Reading source files from path '"+frameworkPath+"'");
		final Collection<File> fwFiles = FileUtils.listFiles(frameworkPath, new IOFileFilter() {
			@Override
			public boolean accept(File dir, String name) {
				return name.toLowerCase().endsWith(".js");
			}
			
			@Override
			public boolean accept(File file) {
				return file.getName().toLowerCase().endsWith(".js");
			}
		}, new IOFileFilter() {
			@Override
			public boolean accept(File dir, String name) {
				return true;
			}
			
			@Override
			public boolean accept(File file) {
				return true;
			}
		});
		
		List<File> jsFiles = new ArrayList<>();
		
		// Add core file first always
		jsFiles.add(coreFile);
		
		// Add source files
		for (File file: fwFiles) {
			if (!file.getAbsoluteFile().equals(coreFile)) {
				jsFiles.add(file);
			}
		}

		// Add source files
		for (String sourceFile: sourceFiles) {
			File file = new File(sourceFile);
			if (file.isAbsolute()) {
			} else {
				file = new File(".", sourceFile);
			}
			jsFiles.add(file);
		}
		
		// Create big giant js file
		System.out.println("Create output string from " + jsFiles.size() + " files");
		StringBuilder js = new StringBuilder();
		js.append("\"use strict\";\n");
		for (File file: jsFiles) {
			List<String> lines = FileUtils.readLines(file);
			if (lines.size() > 0) {
				for (String line: lines) {
					if (!line.startsWith("\"use strict\";")) {
						js.append(line + "\n");
					}
				}
			}
		}
		
		File outFile = outputPath;
		if (outputPath.isDirectory()) {
			outFile = new File(outputPath, "game.js");
		}
		File htmlOutFile = new File(outFile.getAbsolutePath().replace(".js", ".html"));
		
		System.out.println("Write output file '"+outFile+"'");
		FileUtils.write(outFile, js.toString(), "UTF-8", false);
		
		// Template
		System.out.println("Write html file '"+htmlOutFile+"'");
		StringBuilder html = new StringBuilder();
		InputStream templateStream = getClass().getResourceAsStream("template.html");
		List<String> templateLines = IOUtils.readLines(templateStream);
		if (templateLines.size() > 0) {
			for (String line: templateLines) {
				String s = line.replace("[TITLE]", "Der Titel");
				s = s.replace("[JSFILE]", outFile.getName());
				html.append(s + "\n");
			}
		}
		FileUtils.write(htmlOutFile, html.toString(), "UTF-8", false);
		
		
		System.out.println("Uglify file '"+outFile+"'");
		
		UglifyJS uglify = new UglifyJS();
		uglify.exec(new String[]{"--overwrite", "-nm", "-nc", outFile.getAbsolutePath()});
	}
	
	@SuppressWarnings("static-access")
	public static void main( String[] args ) {
	    // create the parser
		System.out.println("finalJS-Builder v0.0.0");
		final Options options = new Options();
		options.addOption("h", false, "Shows this help text");
		options.addOption(OptionBuilder.hasArg().withArgName("Output file").withType(File.class) .withDescription("Specify a output file").create(ARG_OUT));
		options.addOption(OptionBuilder.hasArg().withArgName("Framework path").withType(File.class) .withDescription("Specify a framework path").create(ARG_FW));
		options.addOption(OptionBuilder.hasArg().withArgName("Input file").withDescription("Specify the input file").create(ARG_IN));
	    CommandLineParser parser = new BasicParser();
	    try {
	        // parse the command line arguments
	        CommandLine line = parser.parse( options, args );
	        if (line.hasOption("h")) {
	        	new HelpFormatter().printHelp("finaljs-Builder", options);
	        } else {
	        	if (!line.hasOption(ARG_OUT)) {
	        		System.out.println("No output file given!");
	        	}
	        	if (!line.hasOption(ARG_FW)) {
	        		System.out.println("No framework path given!");
	        	}
	        	if (!line.hasOption(ARG_IN)) {
	        		System.out.println("No input files given!");
	        	}
	        	File outputPath = (File) line.getParsedOptionValue(ARG_OUT);
	        	File frameworkPath = (File) line.getParsedOptionValue(ARG_FW);
	        	String[] sourcePaths = line.getOptionValues(ARG_IN);
	        	
	        	Builder builder = new Builder(frameworkPath, sourcePaths, outputPath);
	        	builder.create();
	        }
	    }
	    catch( ParseException exp ) {
	        // oops, something went wrong
	        System.err.println( "Parsing failed.  Reason: " + exp.getMessage() );
	    } catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
