package com.nextreads.model;

import java.util.List;

public class RecommendationRequest {
    private List<String> books;
    private List<String> genres;

    public List<String> getBooks() { return books; }
    public void setBooks(List<String> books) { this.books = books; }

    public List<String> getGenres() { return genres; }
    public void setGenres(List<String> genres) { this.genres = genres; }
}
