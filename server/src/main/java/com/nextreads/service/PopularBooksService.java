package com.nextreads.service;

import com.nextreads.model.Book;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class PopularBooksService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String SUBJECTS_API_URL = "https://openlibrary.org/subjects/";
    private static final int BOOKS_PER_PAGE = 18;

    //Map display genre names to OpenLibrary subject names
    private static final Map<String, String> GENRE_TO_SUBJECT = new LinkedHashMap<>();

    static {
        GENRE_TO_SUBJECT.put("Fiction", "fiction");
        GENRE_TO_SUBJECT.put("Non-Fiction", "nonfiction");
        GENRE_TO_SUBJECT.put("Fantasy", "fantasy");
        GENRE_TO_SUBJECT.put("Horror", "horror");
        GENRE_TO_SUBJECT.put("Romance", "romance");
        GENRE_TO_SUBJECT.put("Science Fiction", "science_fiction");
        GENRE_TO_SUBJECT.put("Literature", "literature");
        GENRE_TO_SUBJECT.put("Biography", "biography");
    }

    public PopularBooksService() {
    }

    public List<Book> getPopularBooks(List<String> genres, int page) {
        List<Book> books = new ArrayList<>();
        int offset = page * BOOKS_PER_PAGE;

        if (genres == null || genres.isEmpty()) {
            //When no genre selected, show mix from first few genres
            int booksPerGenre = 6;
            int genreOffset = (page * booksPerGenre) % 50; //Cycle through books in each genre
            for (String genre : GENRE_TO_SUBJECT.keySet()) {
                books.addAll(fetchBooksFromSubject(GENRE_TO_SUBJECT.get(genre), booksPerGenre, genreOffset));
                if (books.size() >= BOOKS_PER_PAGE) break;
            }
        } else {
            //Fetch from selected genres periodically
            int booksPerGenre = BOOKS_PER_PAGE / genres.size();
            if (booksPerGenre < 6) booksPerGenre = 6;

            for (String genre : genres) {
                String subject = GENRE_TO_SUBJECT.get(genre);
                if (subject != null) {
                    books.addAll(fetchBooksFromSubject(subject, booksPerGenre, offset));
                }
            }
        }

        //Remove duplicates by key while preserving order
        Set<String> seenKeys = new HashSet<>();
        List<Book> uniqueBooks = new ArrayList<>();
        for (Book book : books) {
            if (book.getKey() != null && seenKeys.add(book.getKey())) {
                uniqueBooks.add(book);
            }
        }

        return uniqueBooks;
    }

    private List<Book> fetchBooksFromSubject(String subject, int limit, int offset) {
        List<Book> books = new ArrayList<>();

        try {
            String url = SUBJECTS_API_URL + subject + ".json?limit=" + limit + "&offset=" + offset;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("works")) {
                List<Map<String, Object>> works = (List<Map<String, Object>>) response.get("works");

                for (Map<String, Object> work : works) {
                    Book book = new Book();
                    book.setKey((String) work.get("key"));
                    book.setTitle((String) work.get("title"));

                    //Get author from authors array
                    List<Map<String, Object>> authors = (List<Map<String, Object>>) work.get("authors");
                    if (authors != null && !authors.isEmpty()) {
                        book.setAuthor((String) authors.get(0).get("name"));
                    }

                    //Get cover ID
                    Object coverId = work.get("cover_id");
                    if (coverId != null) {
                        book.setCoverId(coverId.toString());
                    }

                    //Get first publish year
                    Object year = work.get("first_publish_year");
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

    public List<String> getAvailableGenres() {
        return new ArrayList<>(GENRE_TO_SUBJECT.keySet());
    }
}
