package com.nextreads.controller;

import com.nextreads.model.Book;
import com.nextreads.service.BookService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/search")
    public List<Book> searchBooks(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {
        return bookService.searchBooks(q, limit);
    }
}
