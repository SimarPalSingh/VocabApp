// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: book-open;

/**
 * ============================================================================
 * LEXICON VAULT - iOS Scriptable Widget
 * Displays rotating words from your reading list on your iPhone Home Screen.
 * ============================================================================
 */

// 1. CONFIGURATION
// If you synced to GitHub Gist via the Lexicon Vault web app, paste your RAW Gist URL below.
// Or, pass your Raw Gist URL as the Widget Parameter in the iOS Widget Settings!
const RAW_GIST_URL = ""; 

// Fallback words if offline or before setting up cloud sync
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
  }
];

// Color Theme
const THEME = {
  bg: new Color("#0d0f15"),
  cardBg: new Color("#161a24"),
  gold: new Color("#f59e0b"),
  textPrimary: new Color("#ffffff"),
  textSecondary: new Color("#94a3b8"),
  textMuted: new Color("#64748b"),
  border: new Color("#272e42")
};

// 2. FETCH ACTIVE WORDS
async function loadActiveWords() {
  // Check widget parameter first, then hardcoded URL
  const targetUrl = (args.widgetParameter && args.widgetParameter.trim().length > 0)
    ? args.widgetParameter.trim()
    : RAW_GIST_URL.trim();

  if (targetUrl.length > 0) {
    try {
      const req = new Request(targetUrl);
      req.timeoutInterval = 6;
      const data = await req.loadJSON();
      
      // Look for activeWords or fallback to allWords
      if (data && Array.isArray(data.activeWords) && data.activeWords.length > 0) {
        return data.activeWords;
      }
      if (data && Array.isArray(data.allWords) && data.allWords.length > 0) {
        return data.allWords;
      }
    } catch (e) {
      console.log("Failed to fetch remote words: " + e);
    }
  }

  return FALLBACK_WORDS;
}

// 3. SELECT RANDOM WORD FOR ROTATION
function pickWord(words) {
  if (!words || words.length === 0) return FALLBACK_WORDS[0];
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

// 4. BUILD WIDGET UI
async function createWidget() {
  const words = await loadActiveWords();
  const word = pickWord(words);

  const widget = new ListWidget();
  widget.backgroundColor = THEME.bg;
  widget.setPadding(14, 16, 14, 16);

  // Widget Header
  const headerStack = widget.addStack();
  headerStack.layoutHorizontally();
  headerStack.centerAlignContent();

  const brandText = headerStack.addText("LEXICON");
  brandText.font = Font.boldSystemFont(10);
  brandText.textColor = THEME.gold;
  brandText.letterSpacing = 1.2;

  headerStack.addSpacer();

  const posText = headerStack.addText((word.partOfSpeech || "word").toUpperCase());
  posText.font = Font.mediumSystemFont(9);
  posText.textColor = THEME.textMuted;

  widget.addSpacer(6);

  // Main Word Term
  const termText = widget.addText(word.term);
  termText.font = new Font("Georgia-Bold", config.widgetFamily === "small" ? 20 : 23);
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
  defText.font = Font.systemFont(config.widgetFamily === "small" ? 11 : 12);
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
    // Small widget: show usage snippet so the user gets context exposure!
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

  // Refresh every hour
  const nextRefresh = new Date();
  nextRefresh.setHours(nextRefresh.getHours() + 1);
  widget.refreshAfterDate = nextRefresh;

  return widget;
}

// 5. RUN SCRIPT
async function run() {
  const widget = await createWidget();
  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else {
    // Preview in Scriptable app
    await widget.presentMedium();
  }
  Script.complete();
}

run();
