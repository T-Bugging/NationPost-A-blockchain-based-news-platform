import os
import re
import json
import requests
import feedparser
from bs4 import BeautifulSoup
from urllib.parse import quote_plus
from datetime import datetime, timedelta
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify

# -------------------------------
# Create Blueprint
# -------------------------------
verify_news_bp = Blueprint("verify_news", __name__)

# -------------------------------
# Load API Key
# -------------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("Please set GEMINI_API_KEY in your .env file")

genai.configure(api_key=GEMINI_API_KEY)

# -------------------------------
# Config
# -------------------------------
MAX_DAYS_LOOKBACK = 30
MAX_SOURCES = 5

# -------------------------------
# Helpers
# -------------------------------
def parse_gemini_response_as_dict(response_text):
    """Extract JSON from Gemini response text and return as dict."""
    try:
        match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if match:
            return json.loads(match.group())
        else:
            return {"prediction": "UNKNOWN", "confidence": 0, "reason": response_text}
    except json.JSONDecodeError:
        return {"prediction": "UNKNOWN", "confidence": 0, "reason": response_text}

def extract_headline_from_url(url):
    """Extract headline/title from a webpage URL."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException:
        return None

    soup = BeautifulSoup(response.text, "html.parser")

    if soup.find("meta", property="og:title"):
        return soup.find("meta", property="og:title")["content"].strip()
    elif soup.find("meta", attrs={"name": "twitter:title"}):
        return soup.find("meta", attrs={"name": "twitter:title"})["content"].strip()
    elif soup.find("title"):
        return soup.find("title").get_text().strip()
    elif soup.find("h1"):
        return soup.find("h1").get_text().strip()

    return None

def get_recent_news(query, days=MAX_DAYS_LOOKBACK):
    """Fetch recent news from Google News RSS."""
    base_url = "https://news.google.com/rss/search?q="
    url = f"{base_url}{quote_plus(query)}&hl=en-IN&gl=IN&ceid=IN:en"

    feed = feedparser.parse(url)
    cutoff = datetime.now() - timedelta(days=days)

    recent_news = []
    for entry in feed.entries:
        if hasattr(entry, 'published_parsed'):
            pub_date = datetime(*entry.published_parsed[:6])
            if pub_date >= cutoff:
                recent_news.append({
                    "title": entry.title,
                    "link": entry.link,
                    "published": pub_date.isoformat()
                })

    return recent_news[:MAX_SOURCES]

def fact_check_news(headline, description=""):
    """Fact-check a news claim using headline + description + Gemini."""
    full_claim = f"{headline}. {description}" if description else headline

    # Step 1: Get recent related news
    evidence_news = get_recent_news(full_claim)
    evidence_titles = [news['title'] for news in evidence_news]

    if not evidence_titles:
        return {
            "prediction": "NO EVIDENCE FOUND",
            "confidence": 0,
            "reason": "No related recent news found"
        }, []

    # Step 2: Exact match check
    for title in evidence_titles:
        if headline.lower() in title.lower():
            return {
                "prediction": "REAL",
                "confidence": 100,
                "reason": f"Exact match found in news: '{title}'"
            }, evidence_news

    # Step 3: Ask Gemini
    evidence_text = "\n".join(f"- {title}" for title in evidence_titles)
    model_input = f"""
    Headline: {headline}
    Description: {description}

    Evidence from reputable sources:
    {evidence_text}

    Based on this evidence, decide if the news is REAL or FAKE.
    Respond in JSON format:
    {{
        "prediction": "REAL or FAKE",
        "confidence": "0-100",
        "reason": "Short explanation"
    }}
    """

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(model_input)

    return parse_gemini_response_as_dict(response.text), evidence_news

# -------------------------------
# Blueprint Route
# -------------------------------
@verify_news_bp.route("/verify", methods=["POST"])
def verify_news():
    data = request.json
    url = data.get("url")
    headline = data.get("headline")
    description = data.get("description", "")

    # Case 1: User provides a URL
    if url:
        headline_from_url = extract_headline_from_url(url)
        if not headline_from_url:
            return jsonify({"error": "Could not extract headline from URL"}), 400
        result, sources = fact_check_news(headline_from_url, description)

    # Case 2: User provides headline
    elif headline:
        result, sources = fact_check_news(headline, description)

    else:
        return jsonify({"error": "Provide either 'url' or 'headline'"}), 400

    # Normalize confidence and compute a single 'score' (0-100) where higher = more likely REAL
    def _normalize_confidence(value):
        try:
            c = float(value)
        except (TypeError, ValueError):
            return 0
        c_int = int(round(c))
        return max(0, min(100, c_int))

    def _compute_score(prediction, confidence_int):
        # confidence_int is already 0-100 integer
        if not prediction:
            return confidence_int
        p = str(prediction).lower()
        if "real" in p:
            return confidence_int
        if "fake" in p:
            return max(0, 100 - confidence_int)
        # If no relevant recent articles were found, treat as low confidence (score 0)
        if "no evidence" in p or "unknown" in p:
            return 0
        return confidence_int

    raw_conf = result.get("confidence", 0)
    confidence = _normalize_confidence(raw_conf)
    score_0_100 = _compute_score(result.get("prediction"), confidence)

    # Convert score to 0-10 float with one decimal place
    try:
        score = round((float(score_0_100) / 10.0), 1)
    except (TypeError, ValueError):
        score = 0.0

    return jsonify({
        "prediction": result.get("prediction"),
        "confidence": confidence,
        "score": score,
        "reason": result.get("reason"),
        "sources": sources
    })
