import type { CardType } from "@/types";

export interface DictionaryApiResponse {
  word: string;
  phonetic?: string;
  phonetics: {
    text?: string;
    audio?: string;
  }[];
  meanings: {
    partOfSpeech: string;
    synonyms?: string[];
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
    }[];
  }[];
}

export interface WordDataResult {
  ipa?: string;
  type?: CardType;
  definition?: string;
  example?: string;
  collocation?: string;
  clozeHint?: string;
}

export async function fetchWordData(word: string): Promise<WordDataResult | null> {
  try {
    if (!word || word.trim() === "") return null;
    
    // The dictionary API expects single words mostly, we can trim and URL encode
    const cleanWord = word.trim().split(" ")[0].toLowerCase();
    
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data: DictionaryApiResponse[] = await response.json();
    
    if (!data || data.length === 0) {
      return null;
    }
    
    const entry = data[0];
    
    // 1. Extract IPA
    let ipa = entry.phonetic;
    if (!ipa && entry.phonetics && entry.phonetics.length > 0) {
      const p = entry.phonetics.find(p => p.text);
      if (p) ipa = p.text;
    }
    
    // 2. Extract Type
    let type: CardType = "vocab"; // Default to vocab
    
    if (entry.meanings && entry.meanings.length > 0) {
      const pos = entry.meanings[0].partOfSpeech.toLowerCase();
      // Map part of speech if necessary. 
      // Noun, verb, adjective, etc are all "vocab".
      // If we see phrases/idioms maybe grammar or sentence, but usually dictionary is just "vocab".
      if (pos === "conjunction" || pos === "preposition" || pos === "particle") {
        type = "grammar";
      }
    }

    // 3. Extract English Example & Synonyms
    let exampleStr = "";
    let synonyms: string[] = [];
    
    if (entry.meanings && entry.meanings.length > 0) {
      const firstMeaning = entry.meanings.find(m => m.definitions && m.definitions.length > 0);
      if (firstMeaning) {
        if (firstMeaning.synonyms && firstMeaning.synonyms.length > 0) {
          synonyms = firstMeaning.synonyms;
        }
        
        const firstDef = firstMeaning.definitions[0];
        if (firstDef.example) {
          exampleStr = firstDef.example;
        }
        if (synonyms.length === 0 && firstDef.synonyms && firstDef.synonyms.length > 0) {
          synonyms = firstDef.synonyms;
        }
      }
    }
    
    // 4. Generate Cloze Hint from Synonyms
    let clozeHintStr = "";
    if (synonyms.length > 0) {
      clozeHintStr = synonyms.slice(0, 3).join("/");
    }
    
    // 5. Fetch Vietnamese Meaning
    let definitionStr = "";
    try {
      const viResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=en|vi`);
      if (viResponse.ok) {
        const viData = await viResponse.json();
        if (viData && viData.responseData && viData.responseData.translatedText) {
          definitionStr = viData.responseData.translatedText;
        }
      }
    } catch (e) {
      // Ignore translation errors
    }
    
    return {
      ipa,
      type,
      definition: definitionStr,
      example: exampleStr,
      clozeHint: clozeHintStr
    };
  } catch (error) {
    console.error("Error fetching word data:", error);
    return null;
  }
}
