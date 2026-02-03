package com.nextreads.service;

import com.nextreads.model.Book;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class BookService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String OPEN_LIBRARY_URL = "https://openlibrary.org/search.json";

    public List<Book> searchBooks(String query, int limit) {
        List<Book> books = new ArrayList<>();

        try {
            String url = OPEN_LIBRARY_URL + "?q=" + query.replace(" ", "+") + "&limit=" + limit;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("docs")) {
                List<Map<String, Object>> docs = (List<Map<String, Object>>) response.get("docs");

                for (Map<String, Object> doc : docs) {
                    Book book = new Book();
                    book.setKey((String) doc.get("key"));
                    book.setTitle((String) doc.get("title"));

                    //Get author
                    List<String> authors = (List<String>) doc.get("author_name");
                    if (authors != null && !authors.isEmpty()) {
                        book.setAuthor(authors.get(0));
                    }

                    //Get cover ID
                    Object coverId = doc.get("cover_i");
                    if (coverId != null) {
                        book.setCoverId(coverId.toString());
                    }

                    //Get publish year
                    Object year = doc.get("first_publish_year");
                    if (year != null) {
                        book.setPublishYear((Integer) year);
                    }

                    books.add(book);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return books;
    }
}
