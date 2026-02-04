package com.nextreads.controller;

import com.nextreads.model.Book;
import com.nextreads.model.RecommendationRequest;
import com.nextreads.service.BookService;
import com.nextreads.service.GroqService;
import com.nextreads.service.PopularBooksService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService bookService;
    private final GroqService groqService;
    private final PopularBooksService popularBooksService;

    public BookController(BookService bookService, GroqService groqService, PopularBooksService popularBooksService) {
        this.bookService = bookService;
        this.groqService = groqService;
        this.popularBooksService = popularBooksService;
    }

    @GetMapping("/search")
    public List<Book> searchBooks(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {
        return bookService.searchBooks(q, limit);
    }

    @GetMapping("/popular")
    public List<Book> getPopularBooks(
            @RequestParam(required = false) List<String> genres,
            @RequestParam(defaultValue = "0") int page) {
        return popularBooksService.getPopularBooks(genres, page);
    }

    @PostMapping("/recommendations")
    public List<Book> getRecommendations(@RequestBody RecommendationRequest request) {
        return groqService.getRecommendations(
            request.getBooks() != null ? request.getBooks() : List.of(),
            request.getGenres() != null ? request.getGenres() : List.of()
        );
    }
}
