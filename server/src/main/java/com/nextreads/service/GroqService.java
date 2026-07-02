package com.nextreads.service;

import com.nextreads.model.Book;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;


@Service
public class GroqService {

    @Value("${groq.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final BookService bookService;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    public GroqService(BookService bookService) {
        this.bookService = bookService;
    }

    // ── Discovery page recommendations ───────────────────────────────────────

    public List<Book> getRecommendations(List<String> selectedBooks, List<String> selectedGenres) {
        if (selectedBooks.isEmpty()) return new ArrayList<>();
        String prompt = buildPrompt(selectedBooks);
        String aiResponse = callGroqRaw(prompt);
        List<String> titles = parseRecommendations(aiResponse);
        List<Book> recommendations = new ArrayList<>();
        for (String title : titles) {
            List<Book> result = bookService.searchBooks(title, 1);
            if (!result.isEmpty()) recommendations.add(result.get(0));
            if (recommendations.size() >= 6) break;
        }
        return recommendations;
    }

    // ── AI Chat ───────────────────────────────────────────────────────────────

    private static final String SYSTEM_PROMPT =
        "You are a friendly book recommendation assistant for NextReads. " +
        "Help users find their next great read through natural conversation. " +
        "Keep replies concise and warm. " +
        "You MUST always respond with valid JSON in this exact format: " +
        "{\"reply\": \"your conversational message here\", \"books\": [\"Title by Author\", \"Title by Author\"]} " +
        "Put specific book recommendations in the books array (up to 4). " +
        "If you are not recommending specific books (e.g. asking a clarifying question), use an empty array: \"books\": [] " +
        "Never include anything outside the JSON object. If asked about non-book topics, steer back to books.";

    public Map<String, Object> chat(List<Map<String, String>> messages) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            List<Map<String, Object>> allMessages = new ArrayList<>();
            allMessages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
            for (Map<String, String> msg : messages) {
                allMessages.add(Map.of("role", msg.get("role"), "content", msg.get("content")));
            }

            Map<String, Object> request = new HashMap<>();
            request.put("model", "llama-3.1-8b-instant");
            request.put("messages", allMessages);
            request.put("max_tokens", 600);
            request.put("temperature", 0.7);
            request.put("response_format", Map.of("type", "json_object"));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map> response = restTemplate.exchange(GROQ_URL, HttpMethod.POST, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
                    String raw = (String) msg.get("content");
                    return parseJsonResponse(raw);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Map.of("reply", "Sorry, I'm having trouble connecting. Please try again.", "books", List.of());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonResponse(String raw) {
        try {
            // Use Spring's RestTemplate ObjectMapper via Jackson (already on classpath)
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> parsed = mapper.readValue(raw, Map.class);

            String reply = (String) parsed.getOrDefault("reply", "");
            List<String> bookTitles = (List<String>) parsed.getOrDefault("books", List.of());

            List<Book> books = new ArrayList<>();
            for (String title : bookTitles) {
                List<Book> results = bookService.searchBooks(title, 1);
                if (!results.isEmpty()) books.add(results.get(0));
                if (books.size() >= 4) break;
            }
            return Map.of("reply", reply, "books", books);
        } catch (Exception e) {
            // Fallback: return raw text with no books if JSON parse fails
            return Map.of("reply", raw, "books", List.of());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String callGroqRaw(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> request = new HashMap<>();
            request.put("model", "llama-3.1-8b-instant");
            request.put("messages", List.of(Map.of("role", "user", "content", prompt)));
            request.put("max_tokens", 500);
            request.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map> response = restTemplate.exchange(GROQ_URL, HttpMethod.POST, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
                    return (String) msg.get("content");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    private String buildPrompt(List<String> books) {
        StringBuilder sb = new StringBuilder();
        sb.append("Based on these books the user has enjoyed, recommend exactly 6 similar books. ");
        sb.append("Return only the book titles, one per line, no numbers or extra text.\n\nBooks the user likes:\n");
        for (String book : books) sb.append("- ").append(book).append("\n");
        sb.append("\nRecommend 6 popular, well known books similar to these. Just the titles, one per line.");
        return sb.toString();
    }

    private List<String> parseRecommendations(String response) {
        List<String> titles = new ArrayList<>();
        if (response == null || response.isEmpty()) return titles;
        for (String line : response.split("\n")) {
            String cleaned = line.trim()
                .replaceAll("^\\d+\\.?\\s*", "")
                .replaceAll("^-\\s*", "")
                .replaceAll("[\"*]", "")
                .trim();
            if (!cleaned.isEmpty() && cleaned.length() > 2) titles.add(cleaned);
        }
        return titles;
    }
}
