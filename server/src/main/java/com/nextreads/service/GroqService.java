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

    public List<Book> getRecommendations(List<String> selectedBooks, List<String> selectedGenres) {
        if (selectedBooks.isEmpty()) {
            return new ArrayList<>();
        }

        String prompt = buildPrompt(selectedBooks);
        String aiResponse = callGroq(prompt);
        List<String> recommendedTitles = parseRecommendations(aiResponse);

        List<Book> recommendations = new ArrayList<>();
        for (String title : recommendedTitles) {
            List<Book> searchResult = bookService.searchBooks(title, 1);
            if (!searchResult.isEmpty()) {
                recommendations.add(searchResult.get(0));
            }
            if (recommendations.size() >= 6) break;
        }
        return recommendations;
    }

    private String buildPrompt(List<String> books) {
        StringBuilder sb = new StringBuilder();
        sb.append("Based on these books the user has enjoyed, recommend exactly 6 similar books they might like ");
        sb.append("Return only the book titles, one per line, no numbers or extra text.\n\n");
        sb.append("Books the user likes:\n");
        for (String book : books) {
            sb.append("- ").append(book).append("\n");
        }
        sb.append("\nRecommend 6 popular, well known books similar to these. Just the titles, one per line.");
        return sb.toString();
    }

    private String callGroq(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> request = new HashMap<>();
            request.put("model", "llama-3.1-8b-instant");
            request.put("messages", List.of(message));
            request.put("max_tokens", 500);
            request.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map> response = restTemplate.exchange(GROQ_URL, HttpMethod.POST, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, Object> messageResp = (Map<String, Object>) firstChoice.get("message");
                    return (String) messageResp.get("content");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    private List<String> parseRecommendations(String response) {
        List<String> titles = new ArrayList<>();
        if (response == null || response.isEmpty()) return titles;

        String[] lines = response.split("\n");
        for (String line : lines) {
            String cleaned = line.trim()
                .replaceAll("^\\d+\\.?\\s*", "")
                .replaceAll("^-\\s*", "")
                .replaceAll("\"", "")
                .replaceAll("\\*", "")
                .trim();
            if (!cleaned.isEmpty() && cleaned.length() > 2) {
                titles.add(cleaned);
            }
        }
        return titles;
    }
}
