/**
 * Lexicon Vault - Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Navigation
  const navTabs = document.querySelectorAll('.nav-tab');
  const viewPanels = document.querySelectorAll('.view-panel');
  const syncStatusBtn = document.getElementById('syncStatusBtn');
  const syncStatusLabel = document.getElementById('syncStatusLabel');

  // Words List View
  const wordsListContainer = document.getElementById('wordsList');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const filterChips = document.querySelectorAll('.status-chips .chip');
  const countAll = document.getElementById('count-all');
  const countActive = document.getElementById('count-active');
  const countFamiliar = document.getElementById('count-familiar');
  const countMastered = document.getElementById('count-mastered');
  const activeWidgetCount = document.getElementById('activeWidgetCount');
  const quickAddTriggerBtn = document.getElementById('quickAddTriggerBtn');
  const emptyAddBtn = document.getElementById('emptyAddBtn');

  // Add Word Form
  const addWordForm = document.getElementById('addWordForm');
  const wordInput = document.getElementById('wordInput');
  const lookupBtn = document.getElementById('lookupBtn');
  const lookupSpinner = document.getElementById('lookupSpinner');
  const lookupText = document.getElementById('lookupText');
  const lookupFeedback = document.getElementById('lookupFeedback');
  const phoneticInput = document.getElementById('phoneticInput');
  const posSelect = document.getElementById('posSelect');
  const definitionInput = document.getElementById('definitionInput');
  const defSuggestions = document.getElementById('defSuggestions');
  const defSuggestionsList = document.getElementById('defSuggestionsList');
  const bookInput = document.getElementById('bookInput');
  const sentenceInput = document.getElementById('sentenceInput');
  const cancelAddBtn = document.getElementById('cancelAddBtn');

  // Word Detail Modal
  const wordDetailModal = document.getElementById('wordDetailModal');
  const modalTerm = document.getElementById('modalTerm');
  const modalPosBadge = document.getElementById('modalPosBadge');
  const modalPhonetic = document.getElementById('modalPhonetic');
  const modalAudioBtn = document.getElementById('modalAudioBtn');
  const modalDefinition = document.getElementById('modalDefinition');
  const modalSentence = document.getElementById('modalSentence');
  const modalBook = document.getElementById('modalBook');
  const modalContextBlock = document.getElementById('modalContextBlock');
  const modalStatusButtons = document.querySelectorAll('.modal-lifecycle-selector .status-select-btn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const closeModalDoneBtn = document.getElementById('closeModalDoneBtn');
  const deleteWordBtn = document.getElementById('deleteWordBtn');

  // Widget Mock & Setup
  const previewTabBtns = document.querySelectorAll('.preview-tab-btn');
  const mockWidgetMedium = document.getElementById('mockWidgetMedium');
  const mockWidgetSmall = document.getElementById('mockWidgetSmall');
  const cyclePreviewBtn = document.getElementById('cyclePreviewBtn');
  const copyScriptableBtn = document.getElementById('copyScriptableBtn');
  const copySuccessMsg = document.getElementById('copySuccessMsg');

  // Settings & Sync
  const githubTokenInput = document.getElementById('githubTokenInput');
  const gistIdInput = document.getElementById('gistIdInput');
  const saveSyncConfigBtn = document.getElementById('saveSyncConfigBtn');
  const testSyncBtn = document.getElementById('testSyncBtn');
  const syncResultBanner = document.getElementById('syncResultBanner');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const importJsonInput = document.getElementById('importJsonInput');
  const resetSampleBtn = document.getElementById('resetSampleBtn');

  // Toast
  const toast = document.getElementById('toast');

  // State
  let currentFilter = 'all';
  let currentSearchQuery = '';
  let selectedWordForModal = null;
  let previewWordIndex = 0;
  let currentAudioUrl = '';

  // ==========================================
  // INITIALIZATION
  // ==========================================
  function init() {
    setupNavigation();
    setupEventListeners();
    loadSyncSettings();
    renderWords();
    updateMockWidget();
  }

  // ==========================================
  // NAVIGATION
  // ==========================================
  function switchTab(targetId) {
    navTabs.forEach(tab => {
      const isTarget = tab.getAttribute('data-target') === targetId;
      tab.classList.toggle('active', isTarget);
    });

    viewPanels.forEach(panel => {
      const isTarget = panel.id === targetId;
      panel.classList.toggle('active', isTarget);
    });

    if (targetId === 'view-words') {
      renderWords();
    } else if (targetId === 'view-widget') {
      updateMockWidget();
    }
  }

  function setupNavigation() {
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-target');
        switchTab(targetId);
      });
    });

    quickAddTriggerBtn?.addEventListener('click', () => switchTab('view-add'));
    emptyAddBtn?.addEventListener('click', () => switchTab('view-add'));
    syncStatusBtn?.addEventListener('click', () => switchTab('view-settings'));
  }

  // ==========================================
  // WORDS LIST RENDERING & FILTERS
  // ==========================================
  function renderWords() {
    const allWords = StorageService.getWords();

    // Update Counts
    const activeCount = allWords.filter(w => w.status === 'active').length;
    const familiarCount = allWords.filter(w => w.status === 'familiar').length;
    const masteredCount = allWords.filter(w => w.status === 'mastered').length;

    countAll.textContent = allWords.length;
    countActive.textContent = activeCount;
    countFamiliar.textContent = familiarCount;
    countMastered.textContent = masteredCount;
    activeWidgetCount.textContent = activeCount;

    // Filter & Search
    let filtered = allWords;

    if (currentFilter !== 'all') {
      filtered = filtered.filter(w => w.status === currentFilter);
    }

    if (currentSearchQuery) {
      const q = currentSearchQuery.toLowerCase();
      filtered = filtered.filter(w => 
        w.term.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        (w.bookTitle && w.bookTitle.toLowerCase().includes(q)) ||
        (w.sentence && w.sentence.toLowerCase().includes(q))
      );
    }

    wordsListContainer.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    filtered.forEach(word => {
      const card = createWordCard(word);
      wordsListContainer.appendChild(card);
    });
  }

  function createWordCard(word) {
    const card = document.createElement('div');
    card.className = 'word-card';
    card.setAttribute('data-id', word.id);

    let statusBadgeClass = 'badge-active';
    let statusText = 'On Widget';
    if (word.status === 'familiar') {
      statusBadgeClass = 'badge-familiar';
      statusText = 'Familiar';
    } else if (word.status === 'mastered') {
      statusBadgeClass = 'badge-mastered';
      statusText = 'Mastered';
    }

    const contextHtml = (word.sentence || word.bookTitle) ? `
      <div class="word-context-snippet">
        ${word.sentence ? `
          <span class="word-usage-label">💬 USAGE EXAMPLE:</span>
          <p class="word-usage-sentence">"${escapeHtml(word.sentence)}"</p>
        ` : ''}
        ${word.bookTitle ? `<div class="word-source-tag">📖 ${escapeHtml(word.bookTitle)}</div>` : ''}
      </div>
    ` : '';

    card.innerHTML = `
      <div class="word-card-header">
        <div class="word-term-group">
          <span class="word-term">${escapeHtml(word.term)}</span>
          ${word.phonetic ? `<span class="word-phonetic">${escapeHtml(word.phonetic)}</span>` : ''}
          <span class="word-pos">${escapeHtml(word.partOfSpeech || 'word')}</span>
        </div>
        <span class="word-status-badge ${statusBadgeClass}">${statusText}</span>
      </div>
      <p class="word-definition">${escapeHtml(word.definition)}</p>
      ${contextHtml}
    `;

    card.addEventListener('click', () => openWordModal(word));
    return card;
  }

  // ==========================================
  // DICTIONARY AUTO-LOOKUP & ADD FORM
  // ==========================================
  async function performDictionaryLookup() {
    const term = wordInput.value.trim();
    if (!term) {
      setLookupFeedback('Please type a word first.', 'error');
      wordInput.focus();
      return;
    }

    setLookupLoading(true);
    setLookupFeedback('Searching dictionary...', '');
    defSuggestions.classList.add('hidden');
    defSuggestionsList.innerHTML = '';

    try {
      const data = await DictionaryService.lookup(term);
      
      // Auto-fill fields
      if (data.phonetic) phoneticInput.value = data.phonetic;
      if (data.partOfSpeech) {
        const option = Array.from(posSelect.options).find(o => o.value === data.partOfSpeech);
        if (option) posSelect.value = data.partOfSpeech;
      }
      if (data.definition) definitionInput.value = data.definition;
      if (data.example) {
        sentenceInput.value = data.example;
      }
      currentAudioUrl = data.audioUrl || '';

      // Populate multiple suggestion pills if available
      if (data.suggestions && data.suggestions.length > 1) {
        data.suggestions.forEach(item => {
          const pill = document.createElement('div');
          pill.className = 'suggestion-pill';
          pill.innerHTML = `<strong>(${item.partOfSpeech})</strong> ${escapeHtml(item.definition)}`;
          pill.addEventListener('click', () => {
            definitionInput.value = item.definition;
            if (item.partOfSpeech) {
              const opt = Array.from(posSelect.options).find(o => o.value === item.partOfSpeech);
              if (opt) posSelect.value = item.partOfSpeech;
            }
            showToast('Definition updated from suggestion');
          });
          defSuggestionsList.appendChild(pill);
        });
        defSuggestions.classList.remove('hidden');
      }

      setLookupFeedback(`Found definition & example for "${data.word}"! ✓`, 'success');
      showToast(`Fetched details for ${data.word}`);
    } catch (err) {
      setLookupFeedback(err.message, 'error');
    } finally {
      setLookupLoading(false);
    }
  }

  async function fetchUsageExample() {
    const term = wordInput.value.trim();
    if (!term) {
      showToast('Type a word first to fetch an example sentence.', true);
      wordInput.focus();
      return;
    }

    const fetchBtn = document.getElementById('fetchExampleBtn');
    if (fetchBtn) fetchBtn.disabled = true;

    try {
      showToast(`Searching usage sentences for "${term}"...`);
      const sentence = await DictionaryService.fetchExampleSentence(term);
      if (sentence) {
        sentenceInput.value = sentence;
        showToast('Added living usage example! ✓');
      } else {
        showToast('No example found. You can write your own usage sentence.', true);
      }
    } catch (e) {
      showToast('Could not fetch example sentence.', true);
    } finally {
      if (fetchBtn) fetchBtn.disabled = false;
    }
  }

  function setLookupLoading(isLoading) {
    if (isLoading) {
      lookupSpinner.classList.remove('hidden');
      lookupText.textContent = 'Searching...';
      lookupBtn.disabled = true;
    } else {
      lookupSpinner.classList.add('hidden');
      lookupText.textContent = 'Auto-Fill';
      lookupBtn.disabled = false;
    }
  }

  function setLookupFeedback(msg, type) {
    lookupFeedback.textContent = msg;
    lookupFeedback.className = 'field-feedback ' + type;
  }

  async function handleSaveWord(e) {
    if (e) e.preventDefault();
    const term = wordInput.value.trim();
    let definition = definitionInput.value.trim();

    if (!term) {
      setLookupFeedback('Please enter a word to save.', 'error');
      wordInput.focus();
      showToast('Please enter a word.', true);
      return;
    }

    // If definition is missing, automatically attempt dictionary lookup on the fly!
    if (!definition) {
      const saveBtnText = document.querySelector('#saveWordBtn span');
      const originalText = saveBtnText ? saveBtnText.textContent : 'Save to Vault';
      if (saveBtnText) saveBtnText.textContent = 'Looking up & Saving...';
      const saveBtn = document.getElementById('saveWordBtn');
      if (saveBtn) saveBtn.disabled = true;

      try {
        setLookupFeedback('Fetching definition & usage...', '');
        const data = await DictionaryService.lookup(term);
        if (data.phonetic && !phoneticInput.value) phoneticInput.value = data.phonetic;
        if (data.partOfSpeech) {
          const opt = Array.from(posSelect.options).find(o => o.value === data.partOfSpeech);
          if (opt) posSelect.value = data.partOfSpeech;
        }
        if (data.definition) {
          definition = data.definition;
          definitionInput.value = data.definition;
        }
        if (data.example && !sentenceInput.value.trim()) {
          sentenceInput.value = data.example;
        }
        if (data.audioUrl) currentAudioUrl = data.audioUrl;
      } catch (err) {
        console.warn('Auto-lookup before save did not find entry:', err);
      } finally {
        if (saveBtnText) saveBtnText.textContent = originalText;
        if (saveBtn) saveBtn.disabled = false;
      }
    }

    // If still no definition, check if user provided a sentence or book
    if (!definition) {
      const sentence = sentenceInput.value.trim();
      if (sentence) {
        definition = `(Context: ${sentence})`;
        definitionInput.value = definition;
      } else {
        setLookupFeedback('Could not auto-find definition. Please type a short definition.', 'error');
        definitionInput.focus();
        showToast('Please type a definition or short meaning.', true);
        return;
      }
    }

    // If usage sentence is still empty, auto-fetch one so the widget displays it
    let sentence = sentenceInput.value.trim();
    if (!sentence) {
      try {
        const autoSentence = await DictionaryService.fetchExampleSentence(term);
        if (autoSentence) {
          sentence = autoSentence;
          sentenceInput.value = autoSentence;
        }
      } catch (e) {
        // optional fallback
      }
    }

    const statusRadio = document.querySelector('input[name="wordStatus"]:checked');
    const status = statusRadio ? statusRadio.value : 'active';

    const newWord = StorageService.addWord({
      term,
      phonetic: phoneticInput.value,
      partOfSpeech: posSelect.value,
      definition,
      bookTitle: bookInput.value,
      sentence,
      status,
      audioUrl: currentAudioUrl
    });

    showToast(`Added "${newWord.term}" to your Vault!`);
    resetAddForm();
    switchTab('view-words');
  }

  function resetAddForm() {
    addWordForm.reset();
    currentAudioUrl = '';
    defSuggestions.classList.add('hidden');
    defSuggestionsList.innerHTML = '';
    setLookupFeedback('', '');
  }

  // ==========================================
  // WORD DETAIL MODAL
  // ==========================================
  function openWordModal(word) {
    selectedWordForModal = word;
    modalTerm.textContent = word.term;
    modalPhonetic.textContent = word.phonetic || '';
    modalPosBadge.textContent = word.partOfSpeech || 'word';
    modalPosBadge.className = 'status-badge ' + (word.status === 'active' ? 'badge-active' : word.status === 'familiar' ? 'badge-familiar' : 'badge-mastered');
    modalDefinition.textContent = word.definition;

    if (word.sentence || word.bookTitle) {
      modalContextBlock.classList.remove('hidden');
      modalSentence.textContent = word.sentence ? `"${word.sentence}"` : '';
      modalSentence.style.display = word.sentence ? 'block' : 'none';
      modalBook.textContent = word.bookTitle ? `📖 ${word.bookTitle}` : '';
      modalBook.style.display = word.bookTitle ? 'inline-block' : 'none';
    } else {
      modalContextBlock.classList.add('hidden');
    }

    // Update status buttons in modal
    modalStatusButtons.forEach(btn => {
      const st = btn.getAttribute('data-status');
      btn.classList.toggle('selected', st === word.status);
    });

    wordDetailModal.classList.remove('hidden');
  }

  function closeModal() {
    wordDetailModal.classList.add('hidden');
    selectedWordForModal = null;
  }

  function playPronunciation() {
    if (!selectedWordForModal) return;

    if (selectedWordForModal.audioUrl) {
      const audio = new Audio(selectedWordForModal.audioUrl);
      audio.play().catch(() => speakWithSynthesis(selectedWordForModal.term));
    } else {
      speakWithSynthesis(selectedWordForModal.term);
    }
  }

  function speakWithSynthesis(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('Audio playback not supported on this browser.');
    }
  }

  // ==========================================
  // WIDGET MOCK & PREVIEW
  // ==========================================
  function updateMockWidget() {
    const words = StorageService.getWords().filter(w => w.status === 'active');
    const targetWord = (words.length > 0) ? words[previewWordIndex % words.length] : StorageService.DEFAULT_WORDS[0];

    // Medium Widget Preview
    document.getElementById('previewWordTerm').textContent = targetWord.term;
    document.getElementById('previewWordPhonetic').textContent = targetWord.phonetic || '';
    document.getElementById('previewWordPos').textContent = (targetWord.partOfSpeech || 'word').toUpperCase();
    document.getElementById('previewWordDef').textContent = targetWord.definition;
    document.getElementById('previewWordQuote').textContent = targetWord.sentence ? `"${targetWord.sentence}"` : '"Encountered while reading..."';
    document.getElementById('previewWordBook').textContent = `📖 ${targetWord.bookTitle || 'Reading List'}`;

    // Small Widget Preview
    document.getElementById('previewWordSmallTerm').textContent = targetWord.term;
    document.getElementById('previewWordSmallPhonetic').textContent = targetWord.phonetic || '';
    document.getElementById('previewWordSmallPos').textContent = (targetWord.partOfSpeech || 'word').slice(0, 4);
    document.getElementById('previewWordSmallDef').textContent = targetWord.definition;
    const smallQuoteEl = document.getElementById('previewWordSmallQuote');
    if (smallQuoteEl) {
      smallQuoteEl.textContent = targetWord.sentence ? `💬 "${targetWord.sentence}"` : '💬 "Example sentence..."';
    }
    document.getElementById('previewWordSmallBook').textContent = `📖 ${targetWord.bookTitle || 'Reading List'}`;
  }

  async function copyScriptableCode() {
    try {
      const resp = await fetch('widget/vocab-widget.js');
      let scriptCode = await resp.text();

      // If user has a raw Gist URL, automatically inject it into the script!
      const config = StorageService.getConfig();
      if (config.rawGistUrl) {
        scriptCode = scriptCode.replace(
          'const RAW_GIST_URL = "";',
          `const RAW_GIST_URL = "${config.rawGistUrl}";`
        );
      }

      await navigator.clipboard.writeText(scriptCode);
      copySuccessMsg.classList.remove('hidden');
      showToast('Widget script copied to clipboard!');
      setTimeout(() => copySuccessMsg.classList.add('hidden'), 3500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      showToast('Could not copy automatically. Please copy from widget/vocab-widget.js', true);
    }
  }

  // ==========================================
  // SETTINGS & CLOUD SYNC
  // ==========================================
  function loadSyncSettings() {
    const config = StorageService.getConfig();
    if (config.githubToken) githubTokenInput.value = config.githubToken;
    if (config.gistId) gistIdInput.value = config.gistId;

    if (config.gistId) {
      syncStatusLabel.textContent = 'Gist Synced';
      syncStatusBtn.querySelector('.status-indicator').className = 'status-indicator online';
    } else {
      syncStatusLabel.textContent = 'Local Mode';
      syncStatusBtn.querySelector('.status-indicator').className = 'status-indicator';
    }
  }

  async function handleSaveSync() {
    const token = githubTokenInput.value.trim();
    const gistId = gistIdInput.value.trim();

    if (!token) {
      showSyncBanner('Please provide a GitHub Personal Access Token.', 'error');
      return;
    }

    showSyncBanner('Syncing words to GitHub Gist...', '');
    saveSyncConfigBtn.disabled = true;

    try {
      const newConfig = await StorageService.syncToGist(token, gistId);
      gistIdInput.value = newConfig.gistId;
      showSyncBanner(`Sync Successful! Gist ID: ${newConfig.gistId}. Your iOS Widget will read from this source.`, 'success');
      showToast('Synced to GitHub Gist successfully!');
      loadSyncSettings();
    } catch (err) {
      showSyncBanner(`Sync Failed: ${err.message}`, 'error');
    } finally {
      saveSyncConfigBtn.disabled = false;
    }
  }

  function showSyncBanner(msg, type) {
    syncResultBanner.textContent = msg;
    syncResultBanner.className = 'sync-banner ' + type;
    syncResultBanner.classList.remove('hidden');
  }

  function handleExportJson() {
    const words = StorageService.getWords();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(words, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lexicon_vault_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Vocabulary exported as JSON');
  }

  function handleImportJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          StorageService.saveWords(imported);
          renderWords();
          updateMockWidget();
          showToast(`Imported ${imported.length} words successfully!`);
        } else {
          showToast('Invalid format. Expected JSON array of words.', true);
        }
      } catch {
        showToast('Failed to parse JSON file.', true);
      }
    };
    reader.readAsText(file);
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================
  function setupEventListeners() {
    // Search & Filters
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      renderWords();
    });

    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.getAttribute('data-filter');
        renderWords();
      });
    });

    // Add Word Form
    lookupBtn.addEventListener('click', performDictionaryLookup);
    wordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performDictionaryLookup();
      }
    });
    wordInput.addEventListener('blur', () => {
      if (wordInput.value.trim() && !definitionInput.value.trim()) {
        performDictionaryLookup();
      }
    });

    const fetchExampleBtn = document.getElementById('fetchExampleBtn');
    if (fetchExampleBtn) {
      fetchExampleBtn.addEventListener('click', fetchUsageExample);
    }

    const saveWordBtn = document.getElementById('saveWordBtn');
    if (saveWordBtn) {
      saveWordBtn.addEventListener('click', handleSaveWord);
    }
    addWordForm.addEventListener('submit', handleSaveWord);
    cancelAddBtn.addEventListener('click', resetAddForm);

    // Modal
    closeModalBtn.addEventListener('click', closeModal);
    closeModalDoneBtn.addEventListener('click', closeModal);
    modalAudioBtn.addEventListener('click', playPronunciation);

    wordDetailModal.addEventListener('click', (e) => {
      if (e.target === wordDetailModal) closeModal();
    });

    modalStatusButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (!selectedWordForModal) return;
        const newStatus = btn.getAttribute('data-status');
        StorageService.updateWordStatus(selectedWordForModal.id, newStatus);
        selectedWordForModal.status = newStatus;
        
        modalStatusButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        renderWords();
        updateMockWidget();
        showToast(`Moved to "${newStatus === 'active' ? 'On Widget' : newStatus}"`);
      });
    });

    deleteWordBtn.addEventListener('click', () => {
      if (!selectedWordForModal) return;
      if (confirm(`Remove "${selectedWordForModal.term}" from your vault?`)) {
        StorageService.deleteWord(selectedWordForModal.id);
        closeModal();
        renderWords();
        updateMockWidget();
        showToast('Word removed from vault');
      }
    });

    // Widget Preview & Controls
    previewTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        previewTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const previewType = btn.getAttribute('data-preview');
        if (previewType === 'small') {
          mockWidgetSmall.classList.remove('hidden');
          mockWidgetMedium.classList.add('hidden');
        } else {
          mockWidgetSmall.classList.add('hidden');
          mockWidgetMedium.classList.remove('hidden');
        }
      });
    });

    cyclePreviewBtn.addEventListener('click', () => {
      previewWordIndex++;
      updateMockWidget();
    });

    copyScriptableBtn.addEventListener('click', copyScriptableCode);

    // Settings
    saveSyncConfigBtn.addEventListener('click', handleSaveSync);
    testSyncBtn.addEventListener('click', handleSaveSync);
    exportJsonBtn.addEventListener('click', handleExportJson);
    importJsonInput.addEventListener('change', handleImportJson);
    resetSampleBtn.addEventListener('click', () => {
      if (confirm('Reset vocabulary to the original curated sample list?')) {
        StorageService.resetToSamples();
        renderWords();
        updateMockWidget();
        showToast('Vocabulary reset to samples');
      }
    });
  }

  // ==========================================
  // UTILITIES
  // ==========================================
  function showToast(message, isError = false) {
    toast.textContent = message;
    toast.style.borderColor = isError ? 'var(--status-danger)' : 'var(--border-medium)';
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Start app
  init();
});
