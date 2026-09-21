# Lexicon Vault 📖✨

> A mobile-first vocabulary assimilation app designed for readers, paired with an ambient **iOS Home Screen Widget**.

---

## 🌟 The Philosophy: "Ambient Assimilation"
Traditional flashcard apps turn vocabulary into chores and homework. **Lexicon Vault** takes a reader-first approach:
1. **Friction-Free Capture**: Note a word while reading. One tap auto-fetches its definition, phonetic pronunciation, and part of speech. You simply tag the book title and the sentence where you found it.
2. **Ambient Assimilation**: Active words rotate onto your **iPhone Home Screen widget** throughout the day. You absorb them passively 10–20 times a day until they become second nature.
3. **Mastery Lifecycle**: Words move from `Active (On Widget)` → `Familiar` → `Mastered` (graduating out of rotation into your permanent personal library).

---

## 🚀 Hosting on GitHub Pages (Setup)

This repository is ready to deploy directly to GitHub Pages at zero cost:

1. Go to your repository on GitHub: [github.com/SimarPalSingh/VocabApp](https://github.com/SimarPalSingh/VocabApp).
2. Click **Settings** → **Pages** (in the left sidebar).
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Set the branch to `main` and folder to `/(root)`, then click **Save**.
5. Once built (takes ~1 minute), your app will be live at:
   👉 **`https://simarpalsingh.github.io/VocabApp/`**
6. Open that URL in **Safari on your iPhone**, tap the **Share** icon → **Add to Home Screen**. It will launch and look just like a native iOS app!

---

## 📱 How to Add the Widget to Your iPhone (2 Minutes)

Since Apple does not permit web apps to create widgets natively, we use the free, open-source-friendly [Scriptable app](https://apps.apple.com/app/scriptable/id1405459188) from the official Apple App Store:

1. **Install Scriptable**:
   - Download [Scriptable from the App Store](https://apps.apple.com/app/scriptable/id1405459188) (free, no ads, no sign-up).
2. **Copy the Widget Script**:
   - In your Lexicon Vault web app, go to the **iOS Widget** tab.
   - Tap **"Copy Scriptable Widget Script"**.
3. **Paste in Scriptable**:
   - Open Scriptable on your iPhone.
   - Tap the **+** in the top-right corner to create a new script.
   - Paste the code and tap the title to name it **"Lexicon"**. Tap **Done**.
4. **Add the Widget to your Home Screen**:
   - Go to your iPhone Home Screen and long-press on any empty area until the icons jiggle.
   - Tap the **+** in the top corner to open the iOS Widget Gallery.
   - Search for **Scriptable**.
   - Select either the **Medium** or **Small** widget and tap **Add Widget**.
   - Long-press your new widget → **Edit Widget** → set the Script to **"Lexicon"**.

That's it! Your widget will now showcase your words, complete with definitions and your book quotes.

---

## ☁️ Cloud Sync (For Live Widget Updates)

To have your iPhone widget automatically reflect new words you add on the web app:

1. Create a GitHub Personal Access Token (Classic) with only the `gist` permission at [github.com/settings/tokens](https://github.com/settings/tokens/new?scopes=gist&description=LexiconVaultSync).
2. In Lexicon Vault, navigate to **Settings** → paste your token → tap **Save & Sync Now**.
3. Lexicon will automatically maintain a private Gist containing your active words.
4. When you copy your Scriptable script from the **iOS Widget** tab, your private Gist URL will already be pre-configured!

---

## 💻 Local Testing & Development

You can run this project locally on your Mac anytime:

```bash
# Start a simple local server
npx serve -l 8080 .
# or with Python
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.
