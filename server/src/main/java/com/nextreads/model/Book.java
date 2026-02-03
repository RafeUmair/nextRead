package com.nextreads.model;

public class Book {
    private String key;
    private String title;
    private String author;
    private String coverId;
    private Integer publishYear;

    public Book() {}

    public Book(String key, String title, String author, String coverId, Integer publishYear) {
        this.key = key;
        this.title = title;
        this.author = author;
        this.coverId = coverId;
        this.publishYear = publishYear;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCoverId() { return coverId; }
    public void setCoverId(String coverId) { this.coverId = coverId; }

    public Integer getPublishYear() { return publishYear; }
    public void setPublishYear(Integer publishYear) { this.publishYear = publishYear; }

    public String getCoverUrl() {
        if (coverId != null) {
            return "https://covers.openlibrary.org/b/id/" + coverId + "-M.jpg";
        }
        return null;
    }
}
