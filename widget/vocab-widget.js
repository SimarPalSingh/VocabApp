// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: book-open;

/**
 * ============================================================================
 * LEXICON VAULT - iOS Scriptable Widget (v2.0)
 * 
 * FEATURES:
 * 1. Automatic 1-Hour Sequential Rotation:
 *    Rotates through your library in order every hour so you never get stuck
 *    repeating the same 2 words.
 * 2. Instant Manual Switch:
 *    Tap the widget (or the "Next ❯" button) on your Home Screen to immediately
 *    advance to the next word.
 * 3. Offline Caching:
 *    Synced words are cached locally via FileManager so your widget keeps working
 *    even without internet.
 * 4. Interactive In-App Menu:
 *    Run the script inside Scriptable to browse words, preview sizes, or test sync.
 * ============================================================================
 */

// 1. CONFIGURATION
// If you synced to GitHub Gist via Lexicon Vault, paste your RAW Gist URL below.
// Or pass it via the Widget Parameter in iOS Widget Settings.
const RAW_GIST_URL = "";

// 2. CURATED FALLBACK VOCABULARY (20 rich literary words)
const FALLBACK_WORDS = [
  {
    term: "Ineffable",
    phonetic: "/ɪnˈef.ə.bəl/",
    partOfSpeech: "adjective",
    definition: "Too great or extreme to be expressed or described in words.",
    bookTitle: "The Ocean at the End of the Lane",
    sentence: "The peace of the starlit water was an ineffable experience."
  },
  {
    term: "Petrichor",
    phonetic: "/ˈpet.rɪ.kɔːr/",
    partOfSpeech: "noun",
    definition: "A pleasant, distinctive smell that frequently accompanies the first rain after a warm, dry period.",
    bookTitle: "East of Eden",
    sentence: "The petrichor rose from the dry California soil, whispering of relief."
  },
  {
    term: "Sonder",
    phonetic: "/ˈsɒn.dər/",
    partOfSpeech: "noun",
    definition: "The realization that each random passerby is living a life as vivid and complex as your own.",
    bookTitle: "Dictionary of Obscure Sorrows",
    sentence: "Sitting on the train, a sudden rush of sonder made the passengers feel strangely close."
  },
  {
    term: "Susurrus",
    phonetic: "/suːˈsʌr.əs/",
    partOfSpeech: "noun",
    definition: "A whispering, rustling, or murmuring sound.",
    bookTitle: "The Secret History",
    sentence: "Beyond the tall French windows, a gentle susurrus of autumn leaves brushed against the terrace."
  },
  {
    term: "Ephemeral",
    phonetic: "/ɪˈfem.ər.əl/",
    partOfSpeech: "adjective",
    definition: "Lasting for a very short time; fleeting; transitory.",
    bookTitle: "The Great Gatsby",
    sentence: "The fireworks bloomed over the bay, an ephemeral glory that faded into the night."
  },
  {
    term: "Mellifluous",
    phonetic: "/məˈlɪf.lu.əs/",
    partOfSpeech: "adjective",
    definition: "Sweet or musical; pleasant to hear.",
    bookTitle: "The Song of Achilles",
    sentence: "Her voice possessed a mellifluous cadence that soothed the restless crowd."
  },
  {
    term: "Halcyon",
    phonetic: "/ˈhæl.si.ən/",
    partOfSpeech: "adjective",
    definition: "Denoting a period of time in the past that was idyllically happy and peaceful.",
    bookTitle: "Atonement",
    sentence: "They looked back on those halcyon summer afternoons before the war began."
  },
  {
    term: "Serendipity",
    phonetic: "/ˌser.ənˈdɪp.ə.ti/",
    partOfSpeech: "noun",
    definition: "The occurrence and development of events by chance in a happy or beneficial way.",
    bookTitle: "The Shadow of the Wind",
    sentence: "Discovering the forgotten bookshop in the alley was pure serendipity."
  },
  {
    term: "Vellichor",
    phonetic: "/ˈvel.ɪ.kɔːr/",
    partOfSpeech: "noun",
    definition: "The strange wistfulness of used bookshops, filled with the scent of old paper.",
    bookTitle: "The Storied Life of A.J. Fikry",
    sentence: "He inhaled the vellichor of the dusty shelves, feeling centuries of lives around him."
  },
  {
    term: "Nefarious",
    phonetic: "/nəˈfeə.ri.əs/",
    partOfSpeech: "adjective",
    definition: "Wicked, villainous, or criminal in nature.",
    bookTitle: "The Count of Monte Cristo",
    sentence: "Behind his polite smile lay a nefarious plot years in the making."
  },
  {
    term: "Solitude",
    phonetic: "/ˈsɒl.ɪ.tjuːd/",
    partOfSpeech: "noun",
    definition: "The state or situation of being alone, especially as an agreeable experience.",
    bookTitle: "Walden",
    sentence: "In deep solitude, his mind found the quiet clarity modern life had stolen."
  },
  {
    term: "Eloquence",
    phonetic: "/ˈel.ə.kwəns/",
    partOfSpeech: "noun",
    definition: "Fluent or persuasive speaking or writing.",
    bookTitle: "Middlemarch",
    sentence: "He spoke with an effortless eloquence that held every listener spellbound."
  },
  {
    term: "Hiraeth",
    phonetic: "/ˈhɪə.raɪθ/",
    partOfSpeech: "noun",
    definition: "A homesickness for a home to which you cannot return, or which never was.",
    bookTitle: "How Green Was My Valley",
    sentence: "A poignant sense of hiraeth swept over him as he gazed across the changed valley."
  },
  {
    term: "Limerence",
    phonetic: "/ˈlɪm.ər.əns/",
    partOfSpeech: "noun",
    definition: "The state of being infatuated or obsessed with another person.",
    bookTitle: "Wuthering Heights",
    sentence: "What began as fond affection soon darkened into an all-consuming limerence."
  },
  {
    term: "Syzygy",
    phonetic: "/ˈsɪz.ɪ.dʒi/",
    partOfSpeech: "noun",
    definition: "An alignment of celestial bodies, or an extraordinary pairing of complementary opposites.",
    bookTitle: "Cosmos",
    sentence: "During the rare planetary syzygy, the tides rose to remarkable heights."
  },
  {
    term: "Oblivion",
    phonetic: "/əˈblɪv.i.ən/",
    partOfSpeech: "noun",
    definition: "The state of being unaware or forgotten by history and memory.",
    bookTitle: "Frankenstein",
    sentence: "He wandered into the Arctic snows, seeking peaceful oblivion from his regrets."
  },
  {
    term: "Panacea",
    phonetic: "/ˌpæn.əˈsiː.ə/",
    partOfSpeech: "noun",
    definition: "A solution or remedy for all difficulties or diseases.",
    bookTitle: "Brave New World",
    sentence: "The leaders offered quick pleasures as a panacea for the society's existential grief."
  },
  {
    term: "Quixotic",
    phonetic: "/kwɪkˈsɒt.ɪk/",
    partOfSpeech: "adjective",
    definition: "Exceedingly idealistic; unrealistic and impractical.",
    bookTitle: "Don Quixote",
    sentence: "Setting out to right every wrong in the world was a quixotic but noble quest."
  },
  {
    term: "Ethereal",
    phonetic: "/iˈθɪə.ri.əl/",
    partOfSpeech: "adjective",
    definition: "Extremely delicate and light in a way that seems not of this world.",
    bookTitle: "The Night Circus",
    sentence: "The black-and-white tents had an ethereal glow under the midnight moon."
  },
  {
    term: "Clinomania",
    phonetic: "/ˌklaɪ.nəˈmeɪ.ni.ə/",
    partOfSpeech: "noun",
    definition: "An excessive desire to stay in bed, especially on rainy mornings.",
    bookTitle: "The Bell Jar",
    sentence: "As rain drummed against the glass, a comforting clinomania anchored her under the quilts."
  }
];

// Color Theme
const THEME = {
  bg: new Color("#0d0f15"),
  cardBg: new Color("#161a24"),
  cardHover: new Color("#222838"),
  gold: new Color("#f59e0b"),
  goldSoft: new Color("#fbbf24"),
  textPrimary: new Color("#ffffff"),
  textSecondary: new Color("#94a3b8"),
  textMuted: new Color("#64748b"),
  border: new Color("#272e42")
};

// 3. PERSISTENCE & LOCAL FILE STORAGE (FileManager)
const fm = FileManager.local();
const docDir = fm.documentsDirectory();
const STATE_FILE = fm.joinPath(docDir, "lexicon-vault-state.json");
const WORDS_CACHE_FILE = fm.joinPath(docDir, "lexicon-vault-cached-words.json");

function loadState() {
  try {
    if (fm.fileExists(STATE_FILE)) {
      const raw = fm.readString(STATE_FILE);
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.currentIndex === "number") {
        return parsed;
      }
    }
  } catch (err) {
    console.log("Could not load local state: " + err);
  }
  return {
    currentIndex: 0,
    lastRotationTime: Date.now()
  };
}

function saveState(state) {
  try {
    fm.writeString(STATE_FILE, JSON.stringify(state));
  } catch (err) {
    console.log("Could not save state: " + err);
  }
}

function loadCachedWords() {
  try {
    if (fm.fileExists(WORDS_CACHE_FILE)) {
      const raw = fm.readString(WORDS_CACHE_FILE);
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.log("Could not load cached words: " + err);
  }
  return null;
}

function saveCachedWords(words) {
  try {
    if (Array.isArray(words) && words.length > 0) {
      fm.writeString(WORDS_CACHE_FILE, JSON.stringify(words));
    }
  } catch (err) {
    console.log("Could not cache words: " + err);
  }
}

// 4. FETCH REMOTE WORDS WITH OFFLINE CACHE FALLBACK
async function loadActiveWords() {
  // Check widget parameter first (only if it looks like a URL)
  const paramUrl = (args.widgetParameter && args.widgetParameter.trim().startsWith("http"))
    ? args.widgetParameter.trim()
    : "";
  const targetUrl = paramUrl || RAW_GIST_URL.trim();

  if (targetUrl.length > 0) {
    try {
      const req = new Request(targetUrl);
      req.timeoutInterval = 6;
      const data = await req.loadJSON();

      let list = [];
      if (data && Array.isArray(data.activeWords) && data.activeWords.length > 0) {
        list = data.activeWords;
      } else if (data && Array.isArray(data.allWords) && data.allWords.length > 0) {
        list = data.allWords;
      } else if (Array.isArray(data) && data.length > 0) {
        list = data;
      }

      // If activeWords has fewer than 2 items, supplement with allWords so we don't get stuck!
      if (list.length < 2 && data && Array.isArray(data.allWords) && data.allWords.length > 1) {
        list = data.allWords;
      }

      if (list.length > 0) {
        saveCachedWords(list);
        return list;
      }
    } catch (e) {
      console.log("Failed to fetch remote words: " + e);
    }
  }

  // Fallback to local cache from previous successful sync
  const cached = loadCachedWords();
  if (cached && cached.length > 0) {
    return cached;
  }

  return FALLBACK_WORDS;
}

// 5. ROTATION LOGIC: HOURLY PROGRESSION & SEQUENTIAL ORDER
const ONE_HOUR_MS = 60 * 60 * 1000;

function advanceWordIndex(words, state, forceNext = false) {
  if (!words || words.length === 0) return 0;

  const now = Date.now();
  const elapsed = now - (state.lastRotationTime || now);

  if (forceNext) {
    // Manual switch: advance immediately by 1
    state.currentIndex = (state.currentIndex + 1) % words.length;
    state.lastRotationTime = now;
    saveState(state);
  } else if (elapsed >= ONE_HOUR_MS) {
    // Automatic 1-hour cadence: advance by the number of hours passed
    const hoursPassed = Math.floor(elapsed / ONE_HOUR_MS);
    state.currentIndex = (state.currentIndex + hoursPassed) % words.length;
    // Advance timestamp evenly to maintain clean hourly schedule
    state.lastRotationTime += hoursPassed * ONE_HOUR_MS;
    saveState(state);
  } else {
    // Within the same hour: keep current word stable
    state.currentIndex = state.currentIndex % words.length;
  }

  if (state.currentIndex < 0 || isNaN(state.currentIndex)) {
    state.currentIndex = 0;
    saveState(state);
  }

  return state.currentIndex;
}

// 6. BUILD WIDGET UI
async function createWidget(words, state) {
  const currentIndex = state.currentIndex % words.length;
  const word = words[currentIndex] || FALLBACK_WORDS[0];
  const scriptName = Script.name() || "Lexicon";
  const runNextUrl = `scriptable:///run?scriptName=${encodeURIComponent(scriptName)}&action=next`;

  const widget = new ListWidget();
  widget.backgroundColor = THEME.bg;
  widget.setPadding(14, 16, 14, 16);
  // Tapping the widget body switches to next word
  widget.url = runNextUrl;

  // Header Stack
  const headerStack = widget.addStack();
  headerStack.layoutHorizontally();
  headerStack.centerAlignContent();

  const brandText = headerStack.addText("LEXICON");
  brandText.font = Font.boldSystemFont(10);
  brandText.textColor = THEME.gold;
  brandText.letterSpacing = 1.2;

  headerStack.addSpacer(6);

  // Position counter (e.g. "3/20")
  const counterText = headerStack.addText(`${currentIndex + 1}/${words.length}`);
  counterText.font = Font.mediumSystemFont(9);
  counterText.textColor = THEME.textMuted;

  headerStack.addSpacer();

  // Part of speech
  const posText = headerStack.addText((word.partOfSpeech || "word").toUpperCase());
  posText.font = Font.mediumSystemFont(9);
  posText.textColor = THEME.textMuted;

  // Medium Widget: Interactive "Next ❯" Button Badge
  if (config.widgetFamily !== "small") {
    headerStack.addSpacer(8);
    const nextBtnStack = headerStack.addStack();
    nextBtnStack.layoutHorizontally();
    nextBtnStack.centerAlignContent();
    nextBtnStack.backgroundColor = THEME.cardBg;
    nextBtnStack.cornerRadius = 5;
    nextBtnStack.setPadding(2, 6, 2, 6);
    nextBtnStack.url = runNextUrl;

    const nextBtnText = nextBtnStack.addText("Next ❯");
    nextBtnText.font = Font.boldSystemFont(8.5);
    nextBtnText.textColor = THEME.gold;
  }

  widget.addSpacer(6);

  // Main Word Term
  const termText = widget.addText(word.term);
  termText.font = new Font("Georgia-Bold", config.widgetFamily === "small" ? 19 : 23);
  termText.textColor = THEME.textPrimary;
  termText.lineLimit = 1;

  // Phonetic
  if (word.phonetic && word.phonetic.length > 0) {
    widget.addSpacer(2);
    const phoneticText = widget.addText(word.phonetic);
    phoneticText.font = new Font("Georgia-Italic", 12);
    phoneticText.textColor = THEME.textSecondary;
  }

  widget.addSpacer(6);

  // Definition
  const defText = widget.addText(word.definition);
  defText.font = Font.systemFont(config.widgetFamily === "small" ? 10.5 : 12);
  defText.textColor = new Color("#cbd5e1");
  defText.lineLimit = config.widgetFamily === "small" ? 2 : 3;

  // Medium Widget Extra Details (Usage Sentence & Book)
  if (config.widgetFamily !== "small") {
    if (word.sentence && word.sentence.length > 0) {
      widget.addSpacer(6);
      const quoteStack = widget.addStack();
      quoteStack.layoutVertically();
      quoteStack.backgroundColor = THEME.cardBg;
      quoteStack.cornerRadius = 8;
      quoteStack.setPadding(6, 10, 6, 10);
      quoteStack.url = runNextUrl;

      const quoteHeader = quoteStack.addText("💬 USAGE EXAMPLE");
      quoteHeader.font = Font.boldSystemFont(8);
      quoteHeader.textColor = THEME.gold;
      quoteHeader.letterSpacing = 0.5;

      quoteStack.addSpacer(2);

      const quoteText = quoteStack.addText(`"${word.sentence}"`);
      quoteText.font = new Font("Georgia-Italic", 11);
      quoteText.textColor = new Color("#f1f5f9");
      quoteText.lineLimit = 2;
    }

    if (word.bookTitle && word.bookTitle.length > 0) {
      widget.addSpacer(4);
      const bookText = widget.addText(`📖 ${word.bookTitle}`);
      bookText.font = Font.mediumSystemFont(9);
      bookText.textColor = THEME.textMuted;
    }
  } else {
    // Small Widget: Compact sentence or book quote
    if (word.sentence && word.sentence.length > 0) {
      widget.addSpacer(4);
      const smallQuote = widget.addText(`💬 "${word.sentence}"`);
      smallQuote.font = new Font("Georgia-Italic", 9.5);
      smallQuote.textColor = new Color("#f1f5f9");
      smallQuote.lineLimit = 2;
    } else if (word.bookTitle && word.bookTitle.length > 0) {
      widget.addSpacer(4);
      const bookText = widget.addText(`📖 ${word.bookTitle}`);
      bookText.font = Font.mediumSystemFont(9);
      bookText.textColor = THEME.gold;
      bookText.lineLimit = 1;
    }
  }

  // Schedule Next Refresh: Exactly 1 hour after the current word started
  const nextRefreshDate = new Date(state.lastRotationTime + ONE_HOUR_MS);
  widget.refreshAfterDate = (nextRefreshDate > new Date())
    ? nextRefreshDate
    : new Date(Date.now() + ONE_HOUR_MS);

  return widget;
}

// 7. RUN & EXECUTION HANDLER
async function run() {
  const words = await loadActiveWords();
  const state = loadState();

  // Check if triggered manually (tap on widget or parameter)
  const isNextAction =
    (args.queryParameters && (args.queryParameters.action === "next" || args.queryParameters.next === "true")) ||
    (args.widgetParameter && args.widgetParameter.trim().toLowerCase() === "next");

  if (isNextAction) {
    // Advance index immediately
    advanceWordIndex(words, state, true);
    const updatedWord = words[state.currentIndex];

    // Build and register updated widget
    const widget = await createWidget(words, state);
    Script.setWidget(widget);

    // Optional quick notification confirmation
    try {
      const notif = new Notification();
      notif.title = `📖 Next Word: ${updatedWord.term}`;
      notif.body = `${updatedWord.definition}`;
      await notif.schedule();
    } catch (e) {
      // Notification permission optional
    }

    // Auto-close Scriptable and return to Home Screen
    if (typeof App !== "undefined" && typeof App.close === "function") {
      try {
        App.close();
      } catch (e) {
        await widget.presentMedium();
      }
    } else if (!config.runsInWidget) {
      await widget.presentMedium();
    }
    Script.complete();
    return;
  }

  // Normal Widget Execution (Home Screen timeline refresh)
  if (config.runsInWidget) {
    advanceWordIndex(words, state, false);
    const widget = await createWidget(words, state);
    Script.setWidget(widget);
    Script.complete();
    return;
  }

  // Interactive In-App Mode (when run directly in Scriptable app)
  if (config.runsInApp) {
    advanceWordIndex(words, state, false);
    const currentWord = words[state.currentIndex];

    const alert = new Alert();
    alert.title = "Lexicon Vault";
    alert.message = `Word ${state.currentIndex + 1} of ${words.length}: "${currentWord.term}"\n\nRotates automatically every hour. Tap "Next Word" to switch manually.`;
    alert.addAction("⏭ Next Word");
    alert.addAction("⏮ Previous Word");
    alert.addAction("📱 Preview Medium Widget");
    alert.addAction("📱 Preview Small Widget");
    alert.addAction("🔄 Reset to First Word");
    alert.addCancelAction("Done");

    const choice = await alert.presentSheet();
    if (choice === 0) {
      advanceWordIndex(words, state, true);
      const w = await createWidget(words, state);
      Script.setWidget(w);
      await w.presentMedium();
    } else if (choice === 1) {
      state.currentIndex = (state.currentIndex - 1 + words.length) % words.length;
      state.lastRotationTime = Date.now();
      saveState(state);
      const w = await createWidget(words, state);
      Script.setWidget(w);
      await w.presentMedium();
    } else if (choice === 2) {
      const w = await createWidget(words, state);
      await w.presentMedium();
    } else if (choice === 3) {
      const w = await createWidget(words, state);
      await w.presentSmall();
    } else if (choice === 4) {
      state.currentIndex = 0;
      state.lastRotationTime = Date.now();
      saveState(state);
      const w = await createWidget(words, state);
      Script.setWidget(w);
      await w.presentMedium();
    }
    Script.complete();
    return;
  }

  // Fallback preview
  advanceWordIndex(words, state, false);
  const widget = await createWidget(words, state);
  Script.setWidget(widget);
  await widget.presentMedium();
  Script.complete();
}

run();
