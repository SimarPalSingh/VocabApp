/**
 * DictionaryService
 * Fast, reliable, and 100% CORS-compliant vocabulary & usage search engine.
 * Fetches definitions, parts of speech, and real usage sentences using
 * Datamuse API, Wiktionary, and Wikiquote/Wikipedia corpora.
 */
const DictionaryService = {
  datamuseBaseUrl: 'https://api.datamuse.com/words',
  wiktionaryBaseUrl: 'https://en.wiktionary.org/api/rest_v1/page/definition',
  wikiquoteBaseUrl: 'https://en.wikiquote.org/w/api.php',
  wikipediaBaseUrl: 'https://en.wikipedia.org/w/api.php',

  /**
   * Look up a word and return structured definition, part of speech, and usage example
   * @param {string} word 
   * @returns {Promise<Object>}
   */
  async lookup(word) {
    const trimmed = word.trim().toLowerCase();
    if (!trimmed) {
      throw new Error('Please enter a word to look up.');
    }

    // Run definition and usage example fetching in parallel for maximum speed
    const [defResult, exampleResult] = await Promise.all([
      this.fetchDefinitionWithFallback(trimmed),
      this.fetchExampleSentence(trimmed)
    ]);

    if (!defResult || !defResult.definition) {
      throw new Error(`Could not find an automated definition for "${word}". You can enter your own definition below.`);
    }

    const capitalizedWord = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    return {
      word: capitalizedWord,
      phonetic: defResult.phonetic || '',
      audioUrl: '',
      partOfSpeech: defResult.partOfSpeech || 'noun',
      definition: defResult.definition,
      example: exampleResult || defResult.inlineExample || '',
      suggestions: defResult.suggestions || []
    };
  },

  /**
   * Fetch definition using Datamuse (ultra-fast CORS) with Wiktionary fallback
   */
  async fetchDefinitionWithFallback(term) {
    // 1. Datamuse API (fastest, full CORS support in all browsers)
    try {
      const dmUrl = `${this.datamuseBaseUrl}?sp=${encodeURIComponent(term)}&md=dr&max=1`;
      const data = await this.fetchWithTimeout(dmUrl, 2500);
      if (Array.isArray(data) && data.length > 0 && data[0].defs) {
        const parsed = this.parseDatamuseData(data[0]);
        if (parsed.definition) return parsed;
      }
    } catch (err) {
      console.warn('Datamuse lookup failed, trying Wiktionary:', err.message);
    }

    // 2. Wiktionary REST API (rich definitions & inline examples)
    try {
      const wkUrl = `${this.wiktionaryBaseUrl}/${encodeURIComponent(term)}`;
      const data = await this.fetchWithTimeout(wkUrl, 2500);
      if (data && data.en && data.en.length > 0) {
        const parsed = this.parseWiktionaryData(data);
        if (parsed.definition) return parsed;
      }
    } catch (err) {
      console.warn('Wiktionary lookup failed:', err.message);
    }

    return null;
  },

  /**
   * Parse Datamuse response
   */
  parseDatamuseData(entry) {
    const defs = entry.defs || [];
    const suggestions = [];
    let primaryDef = '';
    let primaryPos = 'noun';

    const posMap = {
      'n': 'noun',
      'v': 'verb',
      'adj': 'adjective',
      'adv': 'adverb',
      'u': 'idiom'
    };

    defs.forEach((rawDef) => {
      const parts = rawDef.split('\t');
      if (parts.length >= 2) {
        const tag = parts[0].trim();
        const defText = parts.slice(1).join('\t').trim();
        const posName = posMap[tag] || 'noun';

        suggestions.push({
          partOfSpeech: posName,
          definition: defText
        });

        if (!primaryDef) {
          primaryDef = defText;
          primaryPos = posName;
        }
      }
    });

    return {
      partOfSpeech: primaryPos,
      definition: primaryDef,
      phonetic: '',
      inlineExample: '',
      suggestions: suggestions.slice(0, 5)
    };
  },

  /**
   * Parse Wiktionary response
   */
  parseWiktionaryData(data) {
    let primaryDef = '';
    let primaryPos = 'noun';
    let inlineExample = '';
    const suggestions = [];

    for (const group of data.en) {
      const pos = (group.partOfSpeech || 'noun').toLowerCase();
      if (Array.isArray(group.definitions)) {
        for (const defObj of group.definitions) {
          const cleanDef = this.cleanHtml(defObj.definition || '');
          if (cleanDef && cleanDef.length > 5) {
            suggestions.push({
              partOfSpeech: pos,
              definition: cleanDef
            });

            if (!primaryDef) {
              primaryDef = cleanDef;
              primaryPos = pos;
            }
          }

          if (!inlineExample) {
            if (Array.isArray(defObj.examples) && defObj.examples.length > 0) {
              inlineExample = this.cleanHtml(defObj.examples[0]);
            } else if (Array.isArray(defObj.parsedExamples) && defObj.parsedExamples.length > 0) {
              inlineExample = this.cleanHtml(defObj.parsedExamples[0].example || '');
            }
          }
        }
      }
    }

    return {
      partOfSpeech: primaryPos,
      definition: primaryDef,
      phonetic: '',
      inlineExample,
      suggestions: suggestions.slice(0, 5)
    };
  },

  /**
   * Fetch living usage sentence quote from Wiktionary literary quotes (passage=...)
   */
  async fetchExampleSentence(term) {
    const termLower = term.toLowerCase().trim();

    // 1. Primary: Extract published book quotes from Wiktionary wikitext
    try {
      const wkUrl = `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(termLower)}&prop=wikitext&format=json&origin=*`;
      const data = await this.fetchWithTimeout(wkUrl, 3000);
      const wikitext = data?.parse?.wikitext?.['*'] || '';

      if (wikitext) {
        const passageRegex = /(?:passage|text)\s*=\s*([^|}]+)/gi;
        let match;
        const quotes = [];
        while ((match = passageRegex.exec(wikitext)) !== null) {
          let rawQuote = match[1];
          let clean = rawQuote
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/\{\{[\s\S]*?\}\}/g, '')
            .replace(/\{\{[\s\S]*$/g, '')
            .replace(/'''?/g, '')
            .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
            .replace(/[\\\/]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          if (clean.length > 25 && clean.toLowerCase().includes(termLower)) {
            clean = clean.replace(/^[,\s;:]+/, '').replace(/[,\s;:]+$/, '');
            if (!/[.!?"]$/.test(clean)) clean += '.';
            quotes.push(clean);
          }
        }

        if (quotes.length > 0) {
          const ideal = quotes.find(q => q.length >= 45 && q.length <= 160);
          return ideal || quotes[0];
        }
      }
    } catch (e) {
      console.warn('Wiktionary wikitext quote search deferred:', e.message);
    }

    // 2. Secondary fallback: Wikiquote search
    try {
      const wqUrl = `${this.wikiquoteBaseUrl}?action=query&list=search&srsearch=%22${encodeURIComponent(termLower)}%22&utf8=1&format=json&origin=*`;
      const data = await this.fetchWithTimeout(wqUrl, 2500);
      if (data && data.query && Array.isArray(data.query.search) && data.query.search.length > 0) {
        for (const item of data.query.search) {
          const clean = this.cleanHtml(item.snippet || '');
          if (clean.length > 25 && clean.toLowerCase().includes(termLower)) {
            return this.formatQuote(clean);
          }
        }
      }
    } catch (e) {
      console.warn('Wikiquote example search deferred:', e.message);
    }

    // 3. Third fallback: Wikipedia search
    try {
      const wikiUrl = `${this.wikipediaBaseUrl}?action=query&list=search&srsearch=%22${encodeURIComponent(termLower)}%22&utf8=1&format=json&origin=*`;
      const data = await this.fetchWithTimeout(wikiUrl, 2500);
      if (data && data.query && Array.isArray(data.query.search) && data.query.search.length > 0) {
        for (const item of data.query.search) {
          const clean = this.cleanHtml(item.snippet || '');
          if (clean.length > 25 && clean.toLowerCase().includes(termLower)) {
            return this.formatQuote(clean);
          }
        }
      }
    } catch (e) {
      console.warn('Wikipedia example search deferred:', e.message);
    }

    return '';
  },

  /**
   * Clean HTML tags, template styles, and entities
   */
  cleanHtml(raw) {
    if (!raw) return '';
    return raw
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  },

  /**
   * Format quote string nicely
   */
  formatQuote(str) {
    let clean = str.trim().replace(/^[^a-zA-Z0-9"']+/g, '');
    if (!/[.!?]$/.test(clean)) {
      clean += '.';
    }
    return clean;
  },

  /**
   * Fetch with timeout using AbortController
   */
  async fetchWithTimeout(url, timeoutMs = 2500) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      clearTimeout(timer);
      if (e.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw e;
    }
  }
};

window.DictionaryService = DictionaryService;
