/**
 * StorageService
 * Manages local persistence (localStorage) and cloud synchronization (GitHub Gist)
 * for the iOS Scriptable Widget.
 */
const StorageService = {
  WORDS_KEY: 'lexicon_vault_words_v1',
  CONFIG_KEY: 'lexicon_vault_config_v1',

  // Curated initial words for immediate delight on first launch
  DEFAULT_WORDS: [
    {
      id: 'word-1',
      term: 'Ineffable',
      phonetic: '/ɪnˈef.ə.bəl/',
      partOfSpeech: 'adjective',
      definition: 'Too great or extreme to be expressed or described in words.',
      bookTitle: 'The Ocean at the End of the Lane',
      sentence: 'The peace of the starlit water was an ineffable experience that words could only dim.',
      status: 'active',
      dateAdded: new Date(Date.now() - 86400000 * 2).toISOString(),
      audioUrl: ''
    },
    {
      id: 'word-2',
      term: 'Petrichor',
      phonetic: '/ˈpet.rɪ.kɔːr/',
      partOfSpeech: 'noun',
      definition: 'A pleasant, distinctive smell that frequently accompanies the first rain after a long period of warm, dry weather.',
      bookTitle: 'East of Eden',
      sentence: 'The petrichor rose from the dry California soil, whispering of relief to the scorched valleys.',
      status: 'active',
      dateAdded: new Date(Date.now() - 86400000 * 4).toISOString(),
      audioUrl: ''
    },
    {
      id: 'word-3',
      term: 'Sonder',
      phonetic: '/ˈsɒn.dər/',
      partOfSpeech: 'noun',
      definition: 'The profound realization that each random passerby is living a life as vivid and complex as your own.',
      bookTitle: 'The Dictionary of Obscure Sorrows',
      sentence: 'Sitting on the midnight train, a sudden rush of sonder made the silent passengers feel strangely close.',
      status: 'active',
      dateAdded: new Date(Date.now() - 86400000 * 6).toISOString(),
      audioUrl: ''
    },
    {
      id: 'word-4',
      term: 'Susurrus',
      phonetic: '/suːˈsʌr.əs/',
      partOfSpeech: 'noun',
      definition: 'A soft, whispering, or rustling sound.',
      bookTitle: 'The Secret History',
      sentence: 'Beyond the tall French windows, a gentle susurrus of autumn leaves brushed against the stone terrace.',
      status: 'active',
      dateAdded: new Date(Date.now() - 86400000 * 8).toISOString(),
      audioUrl: ''
    },
    {
      id: 'word-5',
      term: 'Ephemeral',
      phonetic: '/ɪˈfem.ər.əl/',
      partOfSpeech: 'adjective',
      definition: 'Lasting for a very short time; transitory; fleeting.',
      bookTitle: 'The Great Gatsby',
      sentence: 'The fireworks bloomed over the bay, an ephemeral glory that faded before the smoke cleared.',
      status: 'active',
      dateAdded: new Date(Date.now() - 86400000 * 10).toISOString(),
      audioUrl: ''
    },
    {
      id: 'word-6',
      term: 'Mellifluous',
      phonetic: '/məˈlɪf.lu.əs/',
      partOfSpeech: 'adjective',
      definition: 'Pleasingly smooth and musical to hear.',
      bookTitle: 'The Song of Achilles',
      sentence: 'Her voice had a mellifluous cadence that turned even mundane sentences into melody.',
      status: 'active',
      dateAdded: new Date(Date.now() - 86400000 * 12).toISOString(),
      audioUrl: ''
    },
    {
      id: 'word-7',
      term: 'Halcyon',
      phonetic: '/ˈhæl.si.ən/',
      partOfSpeech: 'adjective',
      definition: 'Denoting a period of time in the past that was idyllically peaceful and happy.',
      bookTitle: 'Atonement',
      sentence: 'They reminisced about the halcyon days of youth, before shadows fell over Europe.',
      status: 'active',
      dateAdded: new Date(Date.now() - 86400000 * 14).toISOString(),
      audioUrl: ''
    },
    {
      id: 'word-8',
      term: 'Serendipity',
      phonetic: '/ˌser.ənˈdɪp.ə.ti/',
      partOfSpeech: 'noun',
      definition: 'The occurrence of valuable discoveries by chance in a happy way.',
      bookTitle: 'The Shadow of the Wind',
      sentence: 'Finding that inscribed volume in the Cemetery of Forgotten Books was pure serendipity.',
      status: 'active',
      dateAdded: new Date(Date.now() - 86400000 * 16).toISOString(),
      audioUrl: ''
    },
    {
      id: 'word-9',
      term: 'Vellichor',
      phonetic: '/ˈvel.ɪ.kɔːr/',
      partOfSpeech: 'noun',
      definition: 'The strange wistfulness of used bookshops, suffused with passage of time.',
      bookTitle: 'The Storied Life of A.J. Fikry',
      sentence: 'He breathed in the warm vellichor of the antiquarian shelves, surrounded by forgotten thoughts.',
      status: 'familiar',
      dateAdded: new Date(Date.now() - 86400000 * 18).toISOString(),
      audioUrl: ''
    },
    {
      id: 'word-10',
      term: 'Nefarious',
      phonetic: '/nəˈfeə.ri.əs/',
      partOfSpeech: 'adjective',
      definition: 'Wicked, villainous, or criminal.',
      bookTitle: 'The Count of Monte Cristo',
      sentence: 'Behind the prosecutor’s respectable facade lay a nefarious ambition that ruined innocent men.',
      status: 'mastered',
      dateAdded: new Date(Date.now() - 86400000 * 20).toISOString(),
      audioUrl: ''
    }
  ],

  /**
   * Load words from localStorage or initialize with defaults
   */
  getWords() {
    try {
      const data = localStorage.getItem(this.WORDS_KEY);
      if (!data) {
        this.saveWords(this.DEFAULT_WORDS);
        return this.DEFAULT_WORDS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.allWords)) return parsed.allWords;
      if (parsed && Array.isArray(parsed.activeWords)) return parsed.activeWords;
      return this.DEFAULT_WORDS;
    } catch (e) {
      console.error('Failed to parse words from storage', e);
      return this.DEFAULT_WORDS;
    }
  },

  /**
   * Save array of words
   */
  saveWords(words) {
    localStorage.setItem(this.WORDS_KEY, JSON.stringify(words));
    // Trigger auto sync in background if configured
    this.autoSyncIfConfigured();
  },

  /**
   * Add a single word
   */
  addWord(wordObj) {
    const words = this.getWords();
    const newWord = {
      id: 'word-' + Date.now(),
      term: wordObj.term.trim(),
      phonetic: (wordObj.phonetic || '').trim(),
      partOfSpeech: (wordObj.partOfSpeech || 'noun').trim().toLowerCase(),
      definition: wordObj.definition.trim(),
      bookTitle: (wordObj.bookTitle || '').trim(),
      sentence: (wordObj.sentence || '').trim(),
      status: wordObj.status || 'active',
      dateAdded: new Date().toISOString(),
      audioUrl: wordObj.audioUrl || ''
    };

    words.unshift(newWord);
    this.saveWords(words);
    return newWord;
  },

  /**
   * Update lifecycle status of a word (active, familiar, mastered)
   */
  updateWordStatus(id, newStatus) {
    const words = this.getWords();
    const target = words.find(w => w.id === id);
    if (target) {
      target.status = newStatus;
      this.saveWords(words);
      return target;
    }
    return null;
  },

  /**
   * Delete a word
   */
  deleteWord(id) {
    let words = this.getWords();
    words = words.filter(w => w.id !== id);
    this.saveWords(words);
    return words;
  },

  /**
   * Reset words to curated sample list
   */
  resetToSamples() {
    this.saveWords(this.DEFAULT_WORDS);
    return this.DEFAULT_WORDS;
  },

  // ==========================================
  // CONFIG & GITHUB GIST SYNC
  // ==========================================

  getConfig() {
    try {
      const data = localStorage.getItem(this.CONFIG_KEY);
      return data ? JSON.parse(data) : { githubToken: '', gistId: '', rawGistUrl: '' };
    } catch {
      return { githubToken: '', gistId: '', rawGistUrl: '' };
    }
  },

  saveConfig(config) {
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
  },

  /**
   * Sync active words to a private GitHub Gist
   */
  async syncToGist(token, existingGistId = '') {
    const trimmedToken = (token || '').trim();
    if (!trimmedToken) {
      throw new Error('Please enter a valid GitHub token.');
    }

    const words = this.getWords();
    const activeList = words.filter(w => w.status === 'active');
    // Payload for the widget: includes all words and a filtered active list
    const payload = {
      updatedAt: new Date().toISOString(),
      appName: 'Lexicon Vault',
      totalWords: words.length,
      activeWords: activeList.length > 0 ? activeList : words,
      allWords: words
    };

    const filesPayload = {
      'lexicon_words.json': {
        content: JSON.stringify(payload, null, 2)
      }
    };

    const headers = {
      'Authorization': `Bearer ${trimmedToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };

    let resultGistId = existingGistId ? existingGistId.trim() : '';
    let response;

    if (resultGistId) {
      // Update existing Gist
      response = await fetch(`https://api.github.com/gists/${resultGistId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          description: 'Lexicon Vault Active Words (iOS Widget Data)',
          files: filesPayload
        })
      });
    } else {
      // Create new private Gist
      response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          description: 'Lexicon Vault Active Words (iOS Widget Data)',
          public: false,
          files: filesPayload
        })
      });
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.message || `GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    resultGistId = data.id;
    const rawUrl = data.files['lexicon_words.json']?.raw_url || '';

    const newConfig = {
      githubToken: trimmedToken,
      gistId: resultGistId,
      rawGistUrl: rawUrl,
      lastSync: new Date().toISOString()
    };
    this.saveConfig(newConfig);

    return newConfig;
  },

  autoSyncIfConfigured() {
    const config = this.getConfig();
    if (config.githubToken && config.gistId) {
      this.syncToGist(config.githubToken, config.gistId).catch(err => {
        console.warn('Background Gist auto-sync deferred:', err);
      });
    }
  }
};

window.StorageService = StorageService;
