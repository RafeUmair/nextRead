package com.nextreads.service;

import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class NewsService {

    private record Feed(String url, String label) {}

    private static final List<Feed> RSS_FEEDS = List.of(
        new Feed("https://feeds.npr.org/1032/rss.xml",        "NPR Books"),
        new Feed("https://bookriot.com/feed/",                 "Book Riot"),
        new Feed("https://lithub.com/feed/",                   "Lit Hub"),
        new Feed("https://www.themarginalian.org/feed/",       "The Marginalian")
    );

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(8))
        .build();

    public Map<String, Object> getLatestNews(int offset, int limit) {
        List<Map<String, String>> articles = new ArrayList<>();
        for (Feed feed : RSS_FEEDS) {
            try {
                articles.addAll(fetchFeed(feed));
            } catch (Exception ignored) {}
        }

        List<Map<String, String>> all = articles.stream()
            .sorted((a, b) -> b.getOrDefault("pubDate", "").compareTo(a.getOrDefault("pubDate", "")))
            .toList();

        int from = Math.min(Math.max(offset, 0), all.size());
        int to = Math.min(from + Math.max(limit, 0), all.size());
        return Map.of(
            "items", all.subList(from, to),
            "hasMore", to < all.size(),
            "total", all.size()
        );
    }

    private List<Map<String, String>> fetchFeed(Feed feed) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(feed.url()))
            .header("User-Agent", "NextReads/1.0")
            .timeout(Duration.ofSeconds(6))
            .GET()
            .build();

        HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

        Document doc = DocumentBuilderFactory.newInstance()
            .newDocumentBuilder()
            .parse(response.body());

        NodeList items = doc.getElementsByTagName("item");
        List<Map<String, String>> articles = new ArrayList<>();

        for (int i = 0; i < items.getLength(); i++) {
            Element item = (Element) items.item(i);
            String title = text(item, "title");
            String link  = text(item, "link");
            String date  = text(item, "pubDate");
            String desc  = stripHtml(text(item, "description"));

            if (!title.isEmpty() && !link.isEmpty()) {
                articles.add(Map.of(
                    "title",       title,
                    "link",        link,
                    "pubDate",     date,
                    "description", desc.length() > 160 ? desc.substring(0, 160) + "…" : desc,
                    "source",      feed.label()
                ));
            }
        }
        return articles;
    }

    private String text(Element parent, String tag) {
        NodeList nodes = parent.getElementsByTagName(tag);
        if (nodes.getLength() == 0) return "";
        return nodes.item(0).getTextContent().trim();
    }

    private String stripHtml(String html) {
        return html.replaceAll("<[^>]*>", "").replaceAll("&[a-z]+;", " ").trim();
    }
}
