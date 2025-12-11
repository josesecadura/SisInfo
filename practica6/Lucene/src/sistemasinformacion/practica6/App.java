package sistemasinformacion.practica6;

import org.apache.lucene.document.Document;
import org.apache.lucene.index.*;
import org.apache.lucene.document.TextField;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.Field;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.es.SpanishAnalyzer;

import org.apache.lucene.store.Directory;
import org.apache.lucene.store.MMapDirectory;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.util.BytesRef;

import java.nio.file.*;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Scanner;
import java.io.*;

public class App {

    private Collection<String> ficherosAIndexar = new ArrayList<>();
    private Analyzer analizador;
    private final static String INDEXDIR = "./doc/indice";

    public App() {
        analizador = new SpanishAnalyzer();
    }

    /**
     *Anade un fichero al indice
    */
    private void anhadirFichero(IndexWriter indice, String path) throws IOException {
        InputStream inputStream = new FileInputStream(path);
        BufferedReader inputStreamReader = new BufferedReader(new InputStreamReader(inputStream, "UTF-8"));

        Document doc = new Document();
        doc.add(new TextField("contenido", inputStreamReader));
        doc.add(new StringField("path", path, Field.Store.YES));
        indice.addDocument(doc);
    }

    /**
     *Indexa todos los archivos .txt de un directorio
    */
    private Directory crearIndiceEnUnDirectorio(String doc) throws IOException {
        IndexWriterConfig config = new IndexWriterConfig(analizador);
        config.setOpenMode(IndexWriterConfig.OpenMode.CREATE);

        Directory dir = new MMapDirectory(Paths.get(INDEXDIR));
        IndexWriter writer = new IndexWriter(dir, config);

       try (DirectoryStream<Path> stream = Files.newDirectoryStream(Paths.get(doc), "*.txt")) {
            for (Path entry : stream) {
                ficherosAIndexar.add(entry.toString());
                anhadirFichero(writer, entry.toString());
            }
        } catch (IOException e) {
            System.err.println("Error al listar los ficheros en ./doc: " + e.getMessage());
        }
        writer.close();
        return dir;
    }

    /**
     * Busca un término y muestra su frecuencia en cada documento
    */
    private void buscarQueryEnIndice(Directory directorioDelIndice, String queryAsString) throws IOException {
        DirectoryReader reader = DirectoryReader.open(directorioDelIndice);
        IndexSearcher buscador = new IndexSearcher(reader);

        QueryParser parser = new QueryParser("contenido", analizador);
        Query query;
        try {
            query = parser.parse(queryAsString);
            TopDocs resultado = buscador.search(query, 150); // max 150 hits
            ScoreDoc[] hits = resultado.scoreDocs;

            System.out.println("\nBuscando \"" + queryAsString + "\": Encontrados " + hits.length + " hits.");

            // 1. EXTRACCIÓN DE LOS TERMINOS ANALIZADOS
            java.util.Set<Term> queryTerms = new java.util.HashSet<>();
            
            // Reescribir la consulta para extraer los términos analizados reales
            Query rewrittenQuery = query.rewrite(reader); 
            rewrittenQuery.createWeight(buscador, false, 1f).extractTerms(queryTerms);

            int i = 0;
            for (ScoreDoc hit : hits) {
                int docId = hit.doc;
                Document doc = buscador.doc(docId);
                System.out.print((++i) + ". " + doc.get("path") + "\tScore: " + hit.score + "\n");

                if (queryTerms.size() == 1) {
                               
                    // Cuenta la frecuencia exacta del término
                    String terminoAnalizado = null;
                    if (query instanceof org.apache.lucene.search.TermQuery) {
                        Term term = ((org.apache.lucene.search.TermQuery) query).getTerm();
                        terminoAnalizado = term.text();
                    }else {
                        terminoAnalizado = queryAsString;
                    }

                    Terms terms = MultiFields.getTerms(reader, "contenido");
                    int freq = 0;
                    if (terms != null) {
                        TermsEnum termsEnum = terms.iterator();
                        if (termsEnum.seekExact(new BytesRef(terminoAnalizado))) {
                            PostingsEnum postings = termsEnum.postings(null);
                            if (postings != null) {
                                int docIdPosting;
                                while ((docIdPosting = postings.nextDoc()) != PostingsEnum.NO_MORE_DOCS) {
                                    if (docIdPosting == docId) {
                                        freq = postings.freq();
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    System.out.println("Frecuencia: " + freq + "\n");
                }
            }
        } catch (ParseException e) {
            System.out.println("Error al parsear la consulta: " + e.getMessage());
        }
    }

    /**
     * Menú interactivo
    */
    public void menu() throws IOException {
        Scanner scanner = new Scanner(System.in);
        Directory indice = null;

        while (true) {
            System.out.println("\n===== MENÚ =====");
            System.out.println("1. Indexar directorio");
            System.out.println("2. Añadir documento al índice");
            System.out.println("3. Buscar término");
            System.out.println("4. Salir");
            System.out.print("\nOpción: ");
            String opcion = scanner.nextLine();

            switch (opcion) {
                case "1":
                    ficherosAIndexar.clear();
                    System.out.print("\nRuta del directorio: ");
                    String nuevoDirectorio = scanner.nextLine();
                    indice = crearIndiceEnUnDirectorio(nuevoDirectorio);
                    System.out.println("\nIndexación completada.");
                    break;

                case "2":
                    if (indice == null) {
                        indice = new MMapDirectory(Paths.get(INDEXDIR));
                    }
                    System.out.print("\nRuta del documento a añadir: ");
                    String nuevoArchivo = scanner.nextLine();
                    IndexWriterConfig config = new IndexWriterConfig(analizador);
                    config.setOpenMode(IndexWriterConfig.OpenMode.APPEND);
                    IndexWriter writer = new IndexWriter(indice, config);
                    anhadirFichero(writer, nuevoArchivo);
                    writer.close();
                    System.out.println("\nDocumento añadido al índice.");
                    break;

                case "3":
                    if (indice == null) {
                        System.out.println("\nPrimero debe indexar el directorio (opción 1).");
                        break;
                    }
                    while (true) {
                        System.out.print("\nTérmino a buscar: ");
                        String termino = scanner.nextLine();
                        if (termino.equalsIgnoreCase("menu")) break;
                        if (termino.isEmpty()) {
                            System.out.println("\nEl término no puede estar vacío.");
                            continue;
                        }
                        buscarQueryEnIndice(indice, termino);
                        System.out.println("\nEscribe 'menu' para volver al menú principal.");
                    }
                    break;

                case "4":
                    System.out.println("\nSaliendo...");
                    scanner.close();
                    return;

                default:
                    System.out.println("Opción inválida. Intente de nuevo.");
            }
        }
    }

    public static void main(String[] args) throws IOException {
        App app = new App();
        app.menu();
    }
}
