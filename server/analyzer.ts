import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

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
const financeWords = ["verification fee", "processing fee", "refundable", "send money", "pay now", "transfer"];

export async function analyzeMessage(message: string) {
  // 1. Extraction Layer
  const urls = message.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g) || [];
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

  if (hasUrgency && hasFear && hasAuthority) {
    heuristicScore += 40;
  } else {
    if (hasUrgency) heuristicScore += 10;
    if (hasFear) heuristicScore += 10;
    if (hasAuthority) heuristicScore += 10;
  }

  let hasSuspiciousTld = false;
  let hasBrandImpersonation = false;

  for (const url of urls) {
    const urlLower = url.toLowerCase();
    if (urlLower.match(/\.(xyz|top|ru|click|vip|online)$/)) {
      heuristicScore += 30;
      hasSuspiciousTld = true;
    }
    if (urlLower.match(/https?:\/\/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/)) {
      heuristicScore += 30;
    }
    if ((urlLower.match(/-/g) || []).length > 2) {
      heuristicScore += 15;
    }
    if (url.length > 50) {
      heuristicScore += 15;
    }
    if (!urlLower.startsWith("https")) {
      heuristicScore += 10;
    }

    // Brand spoof check
    for (const brand of brands) {
      const domains = official_domains[brand];
      const isOfficial = domains.some(d => urlLower.includes(d));
      if (!isOfficial) {
        heuristicScore += 30;
        hasBrandImpersonation = true;
      }
    }
  }

  if (hasFinance && amounts.length > 0) {
    heuristicScore += 25;
  }

  // Grammar detection
  let grammarScore = 0;
  if ((message.match(/[!?]{2,}/g) || []).length > 0) grammarScore += 5;
  const upperCaseWords = message.split(' ').filter(w => w === w.toUpperCase() && w.length > 3).length;
  if (upperCaseWords > 3) grammarScore += 5;
  
  heuristicScore += Math.min(15, grammarScore);
  heuristicScore = Math.min(100, heuristicScore);

  // 3. Gemini AI Analysis
  let aiScore = 0;
  let reasoning = "Heuristic analysis only.";
  let confidence = "Medium";
  let scamType = "Unknown";
  let aiAvailable = false;

  try {
    const prompt = `You are a cybersecurity AI specialized in scam detection. Analyze the following message and determine if it is a scam.
Return ONLY valid JSON with exactly this structure:
{
  "risk_score": <number 0-100>,
  "reasoning": "<short explanation>",
  "confidence": "<Low/Medium/High>",
  "scam_type": "<type of scam or None>"
}
Message:
${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    let text = response.text || "{}";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiData = JSON.parse(text);
    
    aiScore = aiData.risk_score || 0;
    reasoning = aiData.reasoning || "Analyzed by AI.";
    confidence = aiData.confidence || "Medium";
    scamType = aiData.scam_type || "None";
    aiAvailable = true;
  } catch (err) {
    console.error("Gemini AI Error:", err);
  }

  // 4. Hybrid Scoring
  let finalScore = aiAvailable ? (heuristicScore * 0.6) + (aiScore * 0.4) : heuristicScore;

  // Override logic
  if (hasSuspiciousTld && hasBrandImpersonation && hasFinance) {
    finalScore = Math.max(finalScore, 80);
  }
  
  const noRedFlags = !hasUrgency && !hasFear && !hasFinance && urls.length === 0;
  if (noRedFlags) {
    finalScore = Math.min(finalScore, 30);
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
