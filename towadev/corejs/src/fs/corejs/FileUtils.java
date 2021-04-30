package fs.corejs;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.nio.file.Files;

public class FileUtils {
	public static String readStream(InputStream stream) throws IOException {
		StringBuilder s = new StringBuilder();
		try (Reader reader = new InputStreamReader(stream, "UTF-8")) {
			char[] buffer = new char[2048];
			for (;;) {
				int read = reader.read(buffer, 0, buffer.length);
				if (read <= 0) {
					break;
				}
				s.append(buffer, 0, read);
			}
		}
		return s.toString();
	}

	public static String readFile(File file) throws IOException {
		StringBuffer s = new StringBuffer();
		try (InputStream stream = new FileInputStream(file)) {
			s.append(readStream(stream));
		}
		return s.toString();
	}

	public static void writeFile(File file, String input) throws IOException {
		try (OutputStream out = new FileOutputStream(file)) {
			try (Writer writer = new OutputStreamWriter(out, "UTF-8")) {
				writer.write(input);
			}
		}
	}

	public static boolean deleteDirectory(File dir) {
		if (!dir.exists() || !dir.isDirectory()) {
			return false;
		}

		String[] files = dir.list();
		for (int i = 0, len = files.length; i < len; i++) {
			File f = new File(dir, files[i]);
			if (f.isDirectory()) {
				deleteDirectory(f);
			} else {
				f.delete();
			}
		}
		return dir.delete();
	}

	public static String cleanFilename(String filename) {
		String s = filename;
		s = s.replace("<", "_");
		s = s.replace(">", "_");
		s = s.replace(":", "_");
		s = s.replace("\"", "_");
		s = s.replace("/", "_");
		s = s.replace("\\", "_");
		s = s.replace("|", "_");
		s = s.replace("?", "_");
		s = s.replace("*", "_");
		return s;
	}

	public static boolean copyFile(File sourceFile, File targetFile) throws IOException {
		if (!sourceFile.exists() || !sourceFile.isFile()) {
			return false;
		}
		Files.copy(sourceFile.toPath(), targetFile.toPath());
		return true;
	}

	public static boolean copyDirectory(File sourceDir, File targetDir) throws IOException {
		if (!sourceDir.exists() || !sourceDir.isDirectory()) {
			return false;
		}
		if (!targetDir.exists() || !targetDir.isDirectory()) {
			return false;
		}
		File[] sourceFiles = sourceDir.listFiles();
		for (File sourceFile : sourceFiles) {
			if (!sourceFile.isDirectory()) {
				copyFile(sourceFile, new File(targetDir, sourceFile.getName()));
			}
		}
		for (File sourceFile : sourceFiles) {
			if (sourceFile.isDirectory()) {
				File targetFile = new File(targetDir, sourceFile.getName());
				targetFile.mkdir();
				copyDirectory(sourceFile, targetFile);
			}
		}
		return true;
	}
}
