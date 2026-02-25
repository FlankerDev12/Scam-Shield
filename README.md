# ScamShield AI Pro - Hierarchical Security Architecture

This document explains the production-grade security logic used in ScamShield AI Pro to detect and prevent scams.

## Hierarchical Security Scoring

Unlike simple weighted averaging, which often under-scores severe threats, ScamShield AI Pro uses a multi-layered hierarchical approach.

### 1. Detection Layers
- **Extraction Layer**: Automatically parses URLs, UPI IDs, amounts, and brands from raw text.
- **Heuristic Engine**: Checks for psychological triggers (urgency, fear), link intelligence (suspicious TLDs, non-HTTPS), and brand spoofing.
- **AI Layer**: Leverages Gemini 1.5 Flash for deep semantic understanding of intent.

### 2. AI Dominance Rule
If the AI confidence is **High** and the score is **>= 70**, the AI score takes precedence. This ensures that sophisticated scams that might bypass simple keyword filters are caught by semantic analysis.

### 3. Escalation Matrix
To ensure logical consistency and safety, specific high-risk patterns trigger immediate score escalations:
- **Financial + Brand Spoof**: Forced to $\ge 80$.
- **Credential Phishing + Brand Spoof**: Forced to $\ge 75$.
- **UPI Collect Patterns**: Forced to $\ge 85$.
- **Guaranteed Returns (Investment Scams)**: Forced to $\ge 85$.

### 4. Why Weighted Averaging is Unsafe
In cybersecurity, a threat is often binary. If a message contains a phishing link but otherwise seems "normal," a weighted average might result in a "Safe" or "Suspicious" score (e.g., 40). Hierarchical scoring ensures that if a critical threat signal (like brand spoofing) is detected, the risk category is escalated to "High Risk" regardless of other neutral signals.

### 5. Logical Consistency
The system enforces a rule that if a specific `scam_type` is identified by the AI, the final score cannot be less than 60, preventing confusing results where a "Phishing" attempt is marked as "Safe".
