package sistemasinformacion.practica6;

import org.apache.lucene.document.Document;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.document.TextField;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.Field;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.es.SpanishAnalyzer;

import org.apache.lucene.store.Directory;
import org.apache.lucene.store.MMapDirectory;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;


import java.util.ArrayList;
import java.util.Collection;
import java.util.Scanner;
import java.io.IOException;
import java.io.InputStream;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.BufferedReader;
import java.io.File;


/**
 * Clase de ejemplo de un indexador y buscador usando Lucene
 * @author sisinf
 *
 */
public class IndexadorYBuscador{

	/**
	 * Relación de ficheros a indexar / buscar
	 */
	private Collection <String> ficherosAIndexar = new ArrayList<String>();

	/**
	 * Analizar utilizado por el indexador / buscador 
	 */
	private Analyzer analizador;
	
	public IndexadorYBuscador(Collection<String> ficherosAIndexar) {
		 this.ficherosAIndexar = ficherosAIndexar;
		 analizador = new SpanishAnalyzer();
	}
	
	
	/**
	 * Añade un fichero al índice
	 * @param indice Indice que estamos construyendo
	 * @param path ruta del fichero a indexar
	 * @throws IOException
	 */
	private void anhadirFichero(IndexWriter indice, String path) 
	throws IOException {
		InputStream inputStream = new FileInputStream(path);
		BufferedReader inputStreamReader = new BufferedReader(
				new InputStreamReader(inputStream,"UTF-8"));
		
		Document doc = new Document();   
		doc.add(new TextField("contenido", inputStreamReader));
		doc.add(new StringField("path", path, Field.Store.YES));
		indice.addDocument(doc);
	}
	
	
	
	/**
	 * Indexa los ficheros incluidos en "ficherosAIndexar"
	 * @return un índice (Directory) en memoria, con los índices de los ficheros
	 * @throws IOException
	 */
	private Directory crearIndiceEnUnDirectorio(String direc, boolean borrarIndex) throws IOException{
		String INDEXDIR = "./" + direc + "/indice";
		IndexWriter indice = null;
		Directory directorioAlmacenarIndice = new MMapDirectory(Paths.get(INDEXDIR));

		IndexWriterConfig configuracionIndice = new IndexWriterConfig(analizador);
		if (borrarIndex) {
			configuracionIndice.setOpenMode(IndexWriterConfig.OpenMode.CREATE);
		} else {
			configuracionIndice.setOpenMode(IndexWriterConfig.OpenMode.APPEND);
		}
		indice = new IndexWriter(directorioAlmacenarIndice, configuracionIndice);
		
		for (String fichero : ficherosAIndexar) {
			anhadirFichero(indice, fichero);
		}
		
		indice.close();
		return directorioAlmacenarIndice;
	}
	
	
	
	/**
	 * Busca la palabra indicada en queryAsString en el directorioDelIndice.
	 * @param directorioDelIndice
	 * @param paginas
	 * @param hitsPorPagina
	 * @param queryAsString
	 * @throws IOException
	 */
	private void buscarQueryEnIndice(Directory directorioDelIndice, 
										int paginas, 
										int hitsPorPagina, 
										String queryAsString)
	throws IOException{

		DirectoryReader directoryReader = DirectoryReader.open(directorioDelIndice);
		IndexSearcher buscador = new IndexSearcher(directoryReader);
		
		QueryParser queryParser = new QueryParser("contenido", analizador); 
		Query query = null;
		try{
			query = queryParser.parse(queryAsString);
			TopDocs resultado = buscador.search(query, paginas * hitsPorPagina);
			ScoreDoc[] hits = resultado.scoreDocs;
		      
			System.out.println("\nBuscando " + queryAsString + ": Encontrados " + hits.length + " hits.");
			int i = 0;
			for (ScoreDoc hit: hits) {
				int docId = hit.doc;
				
				Document doc = buscador.doc(docId);
				System.out.println((++i) + ". " + doc.get("path") + "\t" + hit.score);
			}

		}catch (ParseException e){
			throw new IOException(e);
		}	
	}
	
	private static void menuPrincipal() {
		System.out.println("\n---------------------------------");
        System.out.println("MENÚ PRINCIPAL DE BÚSQUEDA LUCENE");
        System.out.println("1. Index a directory");
        System.out.println("2. Add a document to the index (optional)");
        System.out.println("3. Search term");
        System.out.println("4. Exit");
        System.out.println("---------------------------------");
        System.out.print("Elegir opción: ");
    }
	
	private static void buscarFich(String path, Collection<String> ficheros) {
	    File dir = new File(path);
	    File[] listaFicheros = dir.listFiles();
	    
	    if (listaFicheros == null) {
	    	// No hay ficheros en el directorio
	        return; 
	    }
	    
	    for (File file : listaFicheros) {
	        if (file.isFile() && file.getName().toLowerCase().endsWith(".txt")) {
	            ficheros.add(file.getAbsolutePath());
	        }
	    }
	}
	
	private static void indexarDirectorio(Scanner sc) throws IOException {
		sc.nextLine();
		System.out.print("Introduce el directorio: ");
		String dir = sc.nextLine();
		Collection<String> ficheros = new ArrayList<String>();
		buscarFich("./" + dir, ficheros);
		IndexadorYBuscador index = new IndexadorYBuscador(ficheros);
		index.crearIndiceEnUnDirectorio(dir, true);
		System.out.println("Índice creado\n");

	}
	
	private static void anyadirDocumento(Scanner sc) throws IOException {
	    sc.nextLine(); 
	    
	    System.out.print("ntroduzca el directorio donde desea añadir: ");
	    String dirIndice = sc.nextLine();
	    
	    String INDEXDIR_ACTUAL = "./" + dirIndice + "/indice";
	    if (!Files.exists(Paths.get(INDEXDIR_ACTUAL))) {
	        System.out.println("Error: El directorio no existe");
	        return;
	    }
	    
	    System.out.print("Introduzca la ruta del nuevo documento: ");
	    String pathDocumento = sc.nextLine();

	    if (!Files.exists(Paths.get(pathDocumento))) {
	        System.out.println("Error: El documento '" + pathDocumento + "' no existe.");
	        return;
	    }

	    Collection<String> nuevoFichero = new ArrayList<>();
	    nuevoFichero.add(pathDocumento);
	    
	    IndexadorYBuscador index = new IndexadorYBuscador(nuevoFichero);
	    
	    index.crearIndiceEnUnDirectorio(dirIndice, false); 

	    System.out.println("\n--- Documento '" + new File(pathDocumento).getName() + "' añadido al índice en modo APPEND. ---");
	}
	
	private static void searchTerm(Scanner sc) throws IOException {		
		sc.nextLine();
		System.out.print("Introduzca el directorio donde desea buscar: ");
		String dir = sc.nextLine();
		
		if (!Files.isDirectory(Paths.get("./" + dir))) {
			System.out.println("El directorio introducido no existe\n");
		} else {
			System.out.print("Introduzca el término a buscar: ");
			String term = sc.nextLine();
			
			if (!term.isEmpty()) {
				Collection <String> ficheros = new ArrayList <String>();
				buscarFich("./" + dir, ficheros);
				Directory directorioDelIndiceCreado = MMapDirectory.open(Paths.get("./" + dir + "/indice"));
				IndexadorYBuscador index = new IndexadorYBuscador(new ArrayList<>());
				index.buscarQueryEnIndice(directorioDelIndiceCreado,ficheros.size(), 1, term);
			}
		}
			
	}
	
	private static void controlarOpciones(int op, Scanner scanner) throws IOException {
		try {
		switch (op) {
		case 1:
			System.out.println("Indexando un directorio...");
			indexarDirectorio(scanner);
			break;
		case 2:
			System.out.println("Añadiendo un documento al índice...");
			anyadirDocumento(scanner);
			break;
		case 3:
			System.out.println("Buscando un término...");
			searchTerm(scanner);
			break;
		default:
			break;
		}
		} catch (Exception e) {
			System.out.println("Se ha producido un error: " + e.getMessage());
		}
	}
	
	/**
	 * Programa principal de prueba. Rellena las colecciones "ficheros" y "queries"
	 * @param args
	 * @throws IOException
	 */
	public static void main(String[]args) throws IOException{
		int op = 0;
		Scanner scanner = new Scanner(System.in);
		do{
			menuPrincipal();
			op = scanner.nextInt();
			if (op == 4) {
				System.out.println("Saliendo...");
				break;
			}
			else if (op < 1 || op > 4) {
				System.out.println("Opción no válida. Inténtelo de nuevo.");
			} else {
				controlarOpciones(op, scanner);
			}
		}while(op != 4 || op < 1 || op > 4);
		scanner.close();
		
	}
	
}

