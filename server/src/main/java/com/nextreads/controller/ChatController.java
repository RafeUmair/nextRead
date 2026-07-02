package com.nextreads.controller;

import com.nextreads.service.GroqService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class ChatController {

    private final GroqService groqService;

    public ChatController(GroqService groqService) {
        this.groqService = groqService;
    }

    @PostMapping("/api/chat")
    public Map<String, Object> chat(@RequestBody Map<String, List<Map<String, String>>> body) {
        List<Map<String, String>> messages = body.getOrDefault("messages", List.of());
        return groqService.chat(messages);
    }
}
