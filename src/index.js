// AI Output QA Gateway & Prompt Shield Engine
class AIOutputQAGateway {
  constructor(options = {}) {
    this.injectionPatterns = [
      /ignore previous instructions/i,
      /system override/i,
      /you are now DAN/i,
      /reveal system prompt/i
    ];
  }

  scanPrompt(prompt) {
    for (const pat of this.injectionPatterns) {
      if (pat.test(prompt)) {
        return { safe: false, reason: 'PROMPT_INJECTION_DETECTED', matchedPattern: pat.toString() };
      }
    }
    return { safe: true };
  }

  scrubPII(text) {
    // Scrub credit cards and live API keys
    const scrubbed = text
      .replace(/\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\b/g, '[REDACTED_CC]')
      .replace(/sk_[a-zA-Z0-9_]{24,}/g, '[REDACTED_API_KEY]');
    return scrubbed;
  }

  repairJSON(rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      return { success: true, data: parsed, wasRepaired: false };
    } catch (e) {
      // Attempt common repair: auto-close unclosed curly braces
      let fixed = rawJson.trim();
      if (fixed.startsWith('{') && !fixed.endsWith('}')) {
        fixed += '}';
      }
      try {
        const parsed = JSON.parse(fixed);
        return { success: true, data: parsed, wasRepaired: true };
      } catch (err) {
        return { success: false, error: 'UNREPAIRABLE_JSON' };
      }
    }
  }
}

module.exports = { AIOutputQAGateway };
