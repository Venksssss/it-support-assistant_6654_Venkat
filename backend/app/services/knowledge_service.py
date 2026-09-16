import re
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.models.knowledge import KnowledgeBase
from app.schemas.knowledge import KnowledgeSearchResult

# ---------------------------------------------------------------------------
# Stop words: generic words that should NOT contribute to relevance scores.
# Critically, technology-related vague words like "error", "working", "system"
# are also excluded because they appear across almost every KB entry and would
# inflate scores for unrelated documents.
# ---------------------------------------------------------------------------
STOP_WORDS = {
    # Articles, conjunctions, prepositions
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
    "in", "is", "it", "its", "of", "on", "or", "that", "the", "to", "was", "were",
    "will", "with", "into", "this", "than", "then", "these", "those", "they",
    # Personal pronouns / question words
    "my", "i", "me", "how", "can", "what", "why", "when", "where", "which", "who",
    # Support-ticket noise words (appear in nearly every question and most KB entries)
    "please", "help", "getting", "having", "does", "do",
    # Negation words (semantically important but too generic to score on)
    "not", "cannot", "cant", "wont", "no", "none",
    # Ubiquitous IT vague words — appear in almost ALL articles, add no signal
    "problem", "issue", "error", "working", "failed", "failure", "fix",
    "try", "using", "use", "open", "show", "get", "set", "new", "also",
    "computer", "system", "device", "user", "service", "mode",
}

# ---------------------------------------------------------------------------
# Technical phrase pairs: two-word phrases that if matched together in the
# question AND the KB entry give a significant bonus. These are specific enough
# that they signal very strong relevance (e.g. "print spooler" means printer).
# ---------------------------------------------------------------------------
TECH_PHRASES = [
    ("wi", "fi"),
    ("wi-fi", "internet"),
    ("wifi", "internet"),
    ("dns", "resolution"),
    ("print", "spooler"),
    ("print", "queue"),
    ("print", "printer"),
    ("vpn", "connect"),
    ("vpn", "tunnel"),
    ("blue", "screen"),
    ("bsod", "crash"),
    ("outlook", "sync"),
    ("outlook", "email"),
    ("email", "sync"),
    ("email", "outlook"),
    ("windows", "update"),
    ("remote", "desktop"),
    ("rdp", "connect"),
    ("cpu", "usage"),
    ("disk", "space"),
    ("audio", "sound"),
    ("bluetooth", "pair"),
]

# Minimum score an entry must achieve to be included in results.
# Entries that barely match (score < threshold) are excluded rather than
# padding the top-3 with irrelevant noise.
MIN_RELEVANCE_THRESHOLD = 3.0


def tokenize(text: str) -> List[str]:
    """
    Normalize text and return a deduplicated list of word tokens.
    Strips punctuation, lowercases, removes stop words, and drops
    very short tokens (≤1 char) that carry no signal.
    """
    words = re.findall(r'\b\w+\b', text.lower())
    return [w for w in words if w not in STOP_WORDS and len(w) > 1]


def _phrase_bonus(question_lower: str, text_lower: str, boost: float = 6.0) -> float:
    """
    Check whether any known technical phrase appears in BOTH the question
    and the KB field text. Each such shared phrase earns a significant bonus.
    This ensures highly specific queries (e.g. 'print queue stuck') rank the
    printer article first, not a BSOD article that also mentions 'system'.
    """
    bonus = 0.0
    for t1, t2 in TECH_PHRASES:
        # The phrase must appear in the question AND in the KB field.
        # Using simple substring check on lowercased text is fast and deterministic.
        q_has = (t1 in question_lower and t2 in question_lower) or \
                (f"{t1}-{t2}" in question_lower) or \
                (f"{t1} {t2}" in question_lower)
        kb_has = (t1 in text_lower and t2 in text_lower) or \
                 (f"{t1}-{t2}" in text_lower) or \
                 (f"{t1} {t2}" in text_lower)
        if q_has and kb_has:
            bonus += boost
    return bonus


class KnowledgeService:
    @staticmethod
    def search(db: Session, question: str, top_k: int = 3) -> Tuple[List[KnowledgeSearchResult], str]:
        """
        Retrieve the most relevant KB entries for a support question.

        Scoring pipeline (fully deterministic, no ML/embeddings):
        1. Tokenize question and each KB field, remove stop words.
        2. Count token overlaps with weighted fields:
               title    → 6.0 pts per matching token (highly specific)
               keywords → 4.0 pts per matching token
               problem  → 2.0 pts per matching token
               solution → 0.5 pts per matching token (broad, least signal)
        3. Exact keyword matching: each individual keyword from the KB entry's
           comma/space-separated keyword list that appears verbatim in the question
           earns +3.0 pts (prevents generic token splits from inflating scores).
        4. Technical phrase bonus: shared domain phrases (e.g. 'print queue',
           'vpn connect') found in both question and KB entry add +6.0 pts each.
        5. Apply minimum relevance threshold (MIN_RELEVANCE_THRESHOLD).
           Entries below it are excluded to prevent irrelevant padding.
        6. Sort descending by score, return top_k.
        """
        question_lower = question.lower()
        question_tokens = set(tokenize(question))
        all_entries = db.query(KnowledgeBase).all()
        scored_results = []

        for entry in all_entries:
            score = 0.0

            # ---- Step 1: tokenize each KB field --------------------------------
            title_tokens = set(tokenize(entry.title))
            keyword_tokens = set(tokenize(entry.keywords))
            problem_tokens = set(tokenize(entry.problem))
            solution_tokens = set(tokenize(entry.solution))

            # ---- Step 2: weighted token-overlap scoring ------------------------
            # Title is the most specific field — strong signal.
            score += len(question_tokens.intersection(title_tokens)) * 6.0
            # Keywords chosen by the author to describe the article — high signal.
            score += len(question_tokens.intersection(keyword_tokens)) * 4.0
            # Problem description — medium signal.
            score += len(question_tokens.intersection(problem_tokens)) * 2.0
            # Solution text — very broad, minimal signal.
            score += len(question_tokens.intersection(solution_tokens)) * 0.5

            # ---- Step 3: individual keyword verbatim match ---------------------
            # Parse each keyword individually (split on space and comma).
            # Only give credit for keywords of length >= 3 to avoid noise from
            # single-letter or two-letter abbreviations that are too generic.
            for kw in re.split(r'[\s,]+', entry.keywords.lower()):
                if len(kw) >= 3 and kw not in STOP_WORDS and kw in question_lower:
                    score += 3.0

            # ---- Step 4: technical phrase bonus --------------------------------
            # Strong shared domain phrases in question + KB title/keywords earn
            # a significant bonus to pull highly relevant articles to the top.
            score += _phrase_bonus(question_lower, entry.title.lower(), boost=7.0)
            score += _phrase_bonus(question_lower, entry.keywords.lower(), boost=5.0)
            score += _phrase_bonus(question_lower, entry.problem.lower(), boost=2.0)

            # ---- Step 5: minimum threshold filter ------------------------------
            if score >= MIN_RELEVANCE_THRESHOLD:
                scored_results.append(KnowledgeSearchResult(
                    id=entry.id,
                    title=entry.title,
                    problem=entry.problem,
                    solution=entry.solution,
                    keywords=entry.keywords,
                    category=entry.category,
                    created_at=entry.created_at,
                    score=score
                ))

        # ---- Step 6: rank and select top results -------------------------------
        scored_results.sort(key=lambda x: x.score, reverse=True)
        top_results = scored_results[:top_k]

        # Graceful fallback: if nothing clears the threshold (very unusual /
        # completely off-topic question), return top 2 without filtering so
        # Gemini still has some context rather than nothing.
        if not top_results and all_entries:
            top_results = [
                KnowledgeSearchResult(
                    id=e.id,
                    title=e.title,
                    problem=e.problem,
                    solution=e.solution,
                    keywords=e.keywords,
                    category=e.category,
                    created_at=e.created_at,
                    score=0.1
                ) for e in all_entries[:2]
            ]

        # ---- Build compact context string for Gemini prompt -------------------
        context_blocks = []
        for idx, item in enumerate(top_results, 1):
            block = (
                f"KNOWLEDGE BASE RESULT {idx}\n"
                f"Title: {item.title}\n"
                f"Category: {item.category}\n"
                f"Problem: {item.problem}\n"
                f"Solution: {item.solution}\n"
            )
            context_blocks.append(block)

        context_string = "\n".join(context_blocks) if context_blocks else "No relevant knowledge base entries found."
        return top_results, context_string
