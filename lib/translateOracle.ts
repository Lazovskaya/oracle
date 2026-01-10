import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TRANSLATION_PROMPTS = {
  ru: `Translate the following trading oracle analysis from English to Russian. Maintain all technical terms, symbol names, and numerical values exactly as they are. Keep the JSON structure intact. Only translate the text fields like market_phase, wave_structure, rationale, risk_note, and bias labels.`,
  fr: `Translate the following trading oracle analysis from English to French. Maintain all technical terms, symbol names, and numerical values exactly as they are. Keep the JSON structure intact. Only translate the text fields like market_phase, wave_structure, rationale, risk_note, and bias labels.`,
  es: `Translate the following trading oracle analysis from English to Spanish. Maintain all technical terms, symbol names, and numerical values exactly as they are. Keep the JSON structure intact. Only translate the text fields like market_phase, wave_structure, rationale, risk_note, and bias labels.`,
  zh: `Translate the following trading oracle analysis from English to Simplified Chinese. Maintain all technical terms, symbol names, and numerical values exactly as they are. Keep the JSON structure intact. Only translate the text fields like market_phase, wave_structure, rationale, risk_note, and bias labels.`,
};

export async function translateOracleResult(
  englishResult: string,
  targetLang: 'ru' | 'fr' | 'es' | 'zh'
): Promise<string> {
  try {
    const prompt = TRANSLATION_PROMPTS[targetLang];
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in financial and trading content. Preserve all JSON structure, numbers, and technical terminology.',
        },
        {
          role: 'user',
          content: `${prompt}\n\n${englishResult}`,
        },
      ],
      temperature: 0.3,
      max_completion_tokens: 3000,
    });

    let translated = response.choices[0]?.message?.content?.trim() || englishResult;
    
    // Strip markdown code blocks if present
    if (translated.startsWith('```json')) {
      translated = translated.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
    } else if (translated.startsWith('```')) {
      translated = translated.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
    }
    
    return translated;
  } catch (error) {
    console.error(`Translation to ${targetLang} failed:`, error);
    return englishResult; // Fallback to English
  }
}

export async function translateOracleToAllLanguages(englishResult: string): Promise<{
  ru: string;
  fr: string;
  es: string;
  zh: string;
}> {
  console.log('Starting translation to all languages (RU, FR, ES, ZH)...');
  
  const [ru, fr, es, zh] = await Promise.all([
    translateOracleResult(englishResult, 'ru'),
    translateOracleResult(englishResult, 'fr'),
    translateOracleResult(englishResult, 'es'),
    translateOracleResult(englishResult, 'zh'),
  ]);

  console.log('All translations completed');
  
  return { ru, fr, es, zh };
}
