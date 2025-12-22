# 🎨 VocaFlow Card Design Guide

This guide outlines the standard structure and best practices for creating vocabulary, grammar, and sentence cards in VocaFlow. Use this ensuring high-quality, consistent learning material.

## 1. Card Types & Structure

### A. Vocabulary Card (Vocab) 📘

**Focus:** Mastering individual words or short phrases.

- **Term:** The word/phrase to learn (e.g., _Epiphany_).
- **Definition:** A clear, concise explanation in English (or target language).
- **IPA:** Phonetic transcription to aid pronunciation (e.g., _/ɪˈpɪf.ən.i/_).
- **Collocation:** Common word associations (e.g., _have an epiphany_).
- **Example:** A sentence showing the word in a natural context.

### B. Grammar Card (Grammar) 📐

**Focus:** Mastering sentence structures and rules.

- **Term:** The formula or structure name (e.g., _Subject + wish + (that) + Past Perfect_).
- **Definition:** Explanation of usage/function (e.g., _Expressing regret about past situations_).
- **IPA:** (Optional) Pronunciation of key auxiliary verbs or leave blank.
- **Collocation:** Related structures or notes (e.g., _See also: 3rd Conditional_).
- **Example:** A complete sentence applying the rule (e.g., _I wish I had studied harder._).

### C. Sentence Card (Sentence) 💬

**Focus:** Mastering idioms, communication patterns, or full expressions.

- **Term:** The full sentence/idiom (e.g., _It's raining cats and dogs_).
- **Definition:** The functional meaning (e.g., _It is raining very heavily_).
- **IPA:** (Optional) Intonation markings or leave blank.
- **Collocation:** The key keyword or idiom used (e.g., _Idioms with 'Rain'_).
- **Example:** A conversational context or variation (e.g., _Don't forget your umbrella!_).

---

## 2. Visual Design Language 🎨

VocaFlow has evolved from a "Neo-Brutalism" style to a **Soft, Modern UI**. All card components should adhere to the following principles:

### A. Aesthetics

- **Borders:** Thin, subtle borders (`border-slate-200` in light mode, `border-slate-800` in dark mode).
- **Shadows:** Gentle, diffused shadows (`shadow-sm` normal, `shadow-md` on hover).
- **Corners:** Rounded corners (`rounded-xl` or `rounded-2xl`).
- **Colors:** Theme-adaptive backgrounds (`bg-white` / `bg-slate-900`) and text (`text-slate-900` / `text-white`).

### B. Layout & Behavior

- **Responsiveness:** Cards should adapt to mobile (full width) and desktop (grid/table) layouts.
- **Micro-interactions:** Subtle hover lift effects (`hover:-translate-y-1`) to indicate interactivity.
- **Dark Mode:** specific `dark:` classes must be used to ensure legibility on dark backgrounds (e.g., high contrast text for secondary info like 'IPA').

---

## 3. Smart Import Usage 📥

Copy the blocks below directly into the **Smart Import** tab in VocaFlow.

**Format Key:** `Term | Definition | IPA | Collocation | Example`

### 📋 SAMPLE DECK: Mixed Types

```text
Serendipity | The occurrence of events by chance in a happy or beneficial way | /ˌser.ənˈdɪp.ə.ti/ | Pure serendipity | Finding that book was pure serendipity.
Resilience | The capacity to recover quickly from difficulties | /rɪˈzɪl.jəns/ | Build resilience | He showed great resilience after the accident.
To be over the moon | To be extremely happy and excited | /ˌoʊ.vɚ ðə ˈmuːn/ | Be over the moon about | She was over the moon about her new job.
S + would rather + (that) + S + V(past) | Expressing a preference for someone else's action | /wʊd ˈræð.ər/ | Would rather structure | I would rather you didn't smoke in here.
Break a leg | Good luck (theatrical slang) | /breɪk ə leɡ/ | Idioms | "Break a leg!" she shouted before he went on stage.
```

### 🧠 SAMPLE DECK: Grammar Focus

```text
S + V + too + adj/adv + (for O) + to V | Structure indicating excess preventing an action | /tuː ... tuː/ | Too structure | The coffee is too hot for me to drink.
It is time + S + V(past) | Expressing that something should have been done already | /ɪts taɪm/ | Subjunctive mood | It is time we went home.
No sooner + had + S + V3 + than + S + V(past) | One event happening immediately after another | /noʊ ˈsuː.nər/ | Inversion | No sooner had I arrived than the phone rang.
```

### 💬 SAMPLE DECK: Functional English

```text
Could you do me a favor? | Requesting help politely | /feɪ.vər/ | Request pattern | Could you do me a favor and open the window?
I'm afraid I can't make it. | Politely declining an invitation | /əˈfreɪd/ | Declining | "Are you coming to the party?" "I'm afraid I can't make it."
Let's call it a day. | Suggesting to stop working | /kɔːl ɪt ə deɪ/ | Work idioms | We've done enough. Let's call it a day.
```
