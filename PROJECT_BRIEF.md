# VocaFlow - Project Brief

**Author:** Hiep DT  
**Status:** Active Development (Beta)  
**Deployment:** [https://vocaflow-9ff5e.web.app](https://vocaflow-9ff5e.web.app)

## 📌 Executive Summary

VocaFlow is a modern, gamified English vocabulary learning web application designed to help users master new words through active recall, spaced repetition (SRS), and interactive drills. Unlike standard flashcard apps, VocaFlow integrates speaking practice (with real-time visualization), sentence reconstruction games, and a comprehensive dashboard to track progress.

## 🛠 Tech Stack

- **Frontend Core:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Shadcn/UI, Framer Motion (Animations)
- **Backend / Services:** Firebase (Authentication, Firestore, Hosting)
- **State Management:** React Context API (Auth), Local Component State
- **Audio/Visual:** Web Audio API (Visualizer), Canvas API (Confetti), SpeechSynthesis API (TTS), Web Speech API (STT)

## ✨ Key Features

### 1. Smart Study System 🧠

- **Flashcards:** Double-sided cards with Term/IPA (Front) and Definition/Example/Collocations (Back).
- **Spaced Repetition (SRS):** Users rate recall quality (Fail/Hard/Good), which determines the next review interval.
- **Auto-Pronunciation:** Integrated Text-to-Speech for correct listening.
- **Cram Mode:** "Review Again" feature allows users to study all cards in a deck immediately, bypassing the SRS schedule.

### 2. Interactive Practice Modes 🎮

- **Speaking Drill:**
  - Real-time audio visualizer ("Dancing Bars") reacting to microphone input.
  - Speech recognition checks user pronunciation against the target word.
  - Immediate feedback (Green Check/Red X) and "Ting" success sound.
- **Sentence Scramble:**
  - Grammar puzzle where users rearrange shuffled words to reconstruct example sentences.
  - Drag-and-drop style interface with celebratory confetti on success.
- **Cloze Test:** Fill-in-the-blank exercises for context retention.

### 3. Gamification & Analytics 🏆

- **User Dashboard:**
  - **Streak System:** Tracks consecutive days of learning.
  - **Mobile Calendar:** Full month view available on mobile devices via a popup modal.
  - **Leveling:** Users gain XP for every correct answer, progressing from "Novice" to "Legend".
  - **Study Heatmap:** A visual grid showing daily activity over the last year.
- **Progress Tracking:** Per-deck and global mastery stats.
- **Modern UX:** Smooth tab switching animations powered by Framer Motion.

### 4. Import Methods 📥

VocaFlow supports two ways to add new cards to a deck:

#### A. Smart Import (Bulk Mode)

Best for importing pre-prepared vocabulary lists quickly.

- **Structure:** Pipe-separated values on each line.
  `Term | Definition | IPA | Collocation | Example`
- **Fields Detail:**

  1. **Term**: The main word or phrase (Required).
  2. **Definition**: Meaning of the term (Required).
  3. **IPA**: Phonetic transcription, e.g., `/həˈloʊ/` (Optional).
  4. **Collocation**: Common usage or related words (Optional).
  5. **Example**: A sentence demonstrating the word in context (Optional).

- **Usage:**
  1. Copy your vocabulary list.
  2. Paste it into the text area in the "Smart Import" tab.
  3. The system parses the text and displays a preview table.
  4. Verify data and select the type (Vocab/Grammar/Sentence) if needed.
  5. Click **Save** to confirm.

#### B. Manual Entry (Interactive Mode)

Best for adding single cards or editing details on the fly.

- **Usage:**
  1. Switch to the "Manual Entry" tab.
  2. Click "Add Row" to create a new empty card.
  3. Fill in the fields (Term, Definition, etc.) directly in the table.
  4. Use the "Type" dropdown to categorize the card.
  5. Click **Save** when finished to batch add all entries.

## 🚀 Deployment

The project is set up with a CI/CD-like workflow using local scripts.

- **Hosting:** Firebase Hosting (SPA Configuration)
- **Build:** `npm run build` (Type check + Vite build)
- **Deploy:** `./deploy.sh` (Automated build & push)

## 📂 Project Structure

```
src/
├── components/
│   ├── dashboard/   # UserProgress, Heatmap, Activity
│   ├── deck/        # Deck creation, Import modal
│   ├── study/       # Flashcard, SpeakingDrill, SentenceScramble
│   └── ui/          # Reusable tokens (Buttons, Dialogs, Sliders)
├── contexts/        # AuthProvider
├── lib/             # Firebase init, Utility functions, Vocab Parser
├── pages/           # Dashboard, Login, Register, StudySession
└── services/        # User stats, XP calculations
```

## 🔮 Future Roadmap

- [ ] **Mobile App:** Wrapper for iOS/Android using Capacitor.
- [ ] **Social Features:** Leaderboards and friend challenges.
- [ ] **AI Generation:** Auto-generate sentences/definitions using Gemini API.
