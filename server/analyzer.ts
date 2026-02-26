import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the API key provided by the user or from environment variables
const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "AIzaSyC9z8N8cYHKNmiztXR9KN2ihLV4GaZnkzA";

const official_domains: Record<string, string[]> = {
  "SBI": ["sbi.co.in", "onlinesbi.sbi"],
  "HDFC": ["hdfcbank.com"],
  "ICICI": ["icicibank.com"],
  "Amazon": ["amazon.in", "amazon.com"],
  "Flipkart": ["flipkart.com"],
  "Paytm": ["paytm.com"],
  "Google": ["google.com", "google.co.in"]
};

const urgencyWords = ["urgent", "immediate", "act now", "action required", "within 24 hours", "expires", "suspended", "blocked"];
const fearTriggers = ["unauthorized login", "compromised", "penalty", "legal action", "arrest", "warrant", "fine", "account suspended"];
const authorityWords = ["police", "rbi", "bank", "customs", "fedex", "trai", "support", "admin", "manager", "income tax"];
const financeWords = ["verification fee", "processing fee", "refundable", "send money", "pay now", "transfer", "kyc pending", "account verification"];
const credentialKeywords = ["verify", "login", "reset", "confirm", "password", "review account", "update kyc"];

export async function analyzeMessage(message: string) {
  // 1. Extraction Layer
  const rawUrls = message.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g) || [];
  const urls = rawUrls.map((url) => url.replace(/[\]\)\}\.,;]+$/g, ""));
  const amounts = message.match(/(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d{1,2})?|[\d,]+(?:\.\d{1,2})?\s*(?:INR|rupees)/gi) || [];
  const upiIds = message.match(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g) || [];
  const phones = message.match(/(?:\+?91|0)?[ -]*[6-9][0-9]{9}/g) || [];
  
  const brands: string[] = [];
  for (const brand of Object.keys(official_domains)) {
    if (message.toLowerCase().includes(brand.toLowerCase())) {
      brands.push(brand);
    }
  }

  // 2. Heuristic Engine
  let heuristicScore = 0;
  const msgLower = message.toLowerCase();

  const hasUrgency = urgencyWords.some(w => msgLower.includes(w));
  const hasFear = fearTriggers.some(w => msgLower.includes(w));
  const hasAuthority = authorityWords.some(w => msgLower.includes(w));
  const hasFinance = financeWords.some(w => msgLower.includes(w));
  const hasCredentials = credentialKeywords.some(w => msgLower.includes(w));

  if (hasUrgency && hasFear && hasAuthority) {
    heuristicScore += 40;
  } else {
    if (hasUrgency) heuristicScore += 15;
    if (hasFear) heuristicScore += 15;
    if (hasAuthority) heuristicScore += 15;
  }

  let hasSuspiciousTld = false;
  let hasBrandSpoof = false;
  let hasSuspiciousUrl = false;

  for (const url of urls) {
    const urlLower = url.toLowerCase();
    if (urlLower.match(/\.(xyz|top|ru|click|vip|online|help|info|live|pw|cc|tk|ml|ga|cf)$/)) {
      heuristicScore += 30;
      hasSuspiciousTld = true;
      hasSuspiciousUrl = true;
    }
    if (urlLower.match(/https?:\/\/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/)) {
      heuristicScore += 30;
      hasSuspiciousUrl = true;
    }
    if ((urlLower.match(/-/g) || []).length > 2) {
      heuristicScore += 15;
      hasSuspiciousUrl = true;
    }
    if (!urlLower.startsWith("https")) {
      heuristicScore += 15;
    }
    // Suspicious keywords in URL path
    if (urlLower.match(/\/(login|verify|update|secure|account|confirm|reset|kyc|payment|refund|reward)/)) {
      heuristicScore += 20;
      hasSuspiciousUrl = true;
    }

    // Brand spoof check
    for (const brand of brands) {
      const domains = official_domains[brand];
      const isOfficial = domains.some(d => urlLower.includes(d));
      if (!isOfficial) {
        heuristicScore += 40;
        hasBrandSpoof = true;
      }
    }
  }

  // Suspicious URL present alongside fear/urgency/authority signals
  if (hasSuspiciousUrl && (hasUrgency || hasFear || hasAuthority || hasCredentials)) {
    heuristicScore += 20;
  }

  if (urls.length > 0) {
    heuristicScore += 5;
  }

  if (hasFinance && (amounts.length > 0 || upiIds.length > 0)) {
    heuristicScore += 30;
  }

  heuristicScore = Math.min(100, heuristicScore);

  // 3. Gemini AI Analysis
  let aiScore = 0;
  let reasoning = "Heuristic analysis only.";
  let confidence = "Low";
  let scamType = "None";
  let aiAvailable = false;

  if (geminiKey) {
    try {
      const ai = new GoogleGenerativeAI(geminiKey);
      const prompt = `You are a cybersecurity AI specialized in scam detection. Analyze the message and return ONLY JSON:
{
"risk_score": number (0-100),
"reasoning": "short explanation",
"confidence": "Low/Medium/High",
"scam_type": "type or None"
}
Message: ${message}`;

      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text() || "{}";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const match = text.match(/\{[\s\S]*\}/);
      const jsonText = match ? match[0] : text;
      const aiData = JSON.parse(jsonText);
      
      aiScore = aiData.risk_score || 0;
      reasoning = aiData.reasoning || "Analyzed by AI.";
      confidence = aiData.confidence || "Medium";
      scamType = aiData.scam_type || "None";
      aiAvailable = true;
    } catch (err: any) {
      if (err?.status === 429) {
        reasoning = "AI quota exceeded – heuristic analysis used.";
        console.warn("Gemini quota exceeded, using heuristic only.");
      } else if (err?.status === 404) {
        reasoning = "AI model unavailable – heuristic analysis used.";
        console.warn("Gemini model not available for this API key.");
      } else if (err?.status === 401 || err?.status === 403) {
        reasoning = "AI unavailable – invalid API key.";
        console.warn("Gemini API key invalid or unauthorized.");
      } else {
        console.error("Gemini AI Error:", err?.message || err);
      }
    }
  }

  // 4. Hierarchical Scoring Architecture (CRITICAL)
  let finalScore = aiAvailable ? (heuristicScore * 0.6) + (aiScore * 0.4) : heuristicScore;

  // AI Dominance Rule
  if (aiAvailable && confidence === "High" && aiScore >= 70) {
    finalScore = Math.max(aiScore, heuristicScore);
  }

  // Escalation Rules
  const financialRequest = hasFinance || amounts.length > 0 || upiIds.length > 0;
  
  // Financial Scam Escalation
  if (financialRequest && hasBrandSpoof) {
    finalScore = Math.max(finalScore, 80);
  }

  // Credential Harvest Escalation
  if (hasBrandSpoof && hasCredentials) {
    finalScore = Math.max(finalScore, 75);
  }

  // UPI Collect Scam Escalation (heuristic pattern)
  const hasUpiCollect = msgLower.includes("collect") && upiIds.length > 0;
  if (hasUpiCollect) {
    finalScore = Math.max(finalScore, 85);
  }

  // Investment Scam Escalation
  const hasInvestmentScam = msgLower.includes("guaranteed") && (msgLower.includes("return") || msgLower.includes("profit"));
  if (hasInvestmentScam) {
    finalScore = Math.max(finalScore, 85);
  }

  // Safe Cap Rule
  const noSuspiciousSignals = !hasUrgency && !hasFear && !hasFinance && urls.length === 0 && !hasBrandSpoof && !hasSuspiciousUrl && !hasSuspiciousTld;
  if (noSuspiciousSignals && aiScore < 40) {
    finalScore = Math.min(finalScore, 30);
  }

  // Logical Consistency Check
  if (scamType !== "None" && finalScore < 60) {
    finalScore = 60;
  }

  finalScore = Math.round(Math.min(100, Math.max(0, finalScore)));

  let riskCategory = "Safe";
  if (finalScore >= 61) riskCategory = "High Risk";
  else if (finalScore >= 31) riskCategory = "Suspicious";

  return {
    riskScore: finalScore,
    riskCategory,
    reasoning,
    confidence,
    scamType,
    extracted: {
      urls,
      amounts,
      upiIds,
      phones,
      brands
    }
  };
}
