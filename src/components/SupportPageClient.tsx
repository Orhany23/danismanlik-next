"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

const JOURNAL_MAX_CHARS = 3000;

type JournalEntry = { id: string; text: string; createdAt: number };

export default function SupportPageClient() {
  const { dict } = useLocale();
  const t = dict.support;

  // Duygu durumu seçimi — sadece önceden yazılmış öneriyi göstermek için.
  // Klinik puanlama veya tanı yok.
  const [selectedMoodKey, setSelectedMoodKey] = useState<string | null>(null);
  const selectedMood = useMemo(
    () => t.moods.items.find((m) => m.key === selectedMoodKey) ?? null,
    [t, selectedMoodKey]
  );

  // Oturumluk günlük — SADECE bileşen belleğinde (React state). Veritabanı,
  // localStorage, cookie veya sunucuya HİÇBİR ŞEKİLDE gönderilmez/kaydedilmez.
  // Sayfa yenilendiğinde veya kapatıldığında bu state tamamen kaybolur.
  const [journalDraft, setJournalDraft] = useState("");
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  const addJournalEntry = () => {
    const text = journalDraft.trim();
    if (!text) return;
    setJournalEntries((prev) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text, createdAt: Date.now() },
      ...prev,
    ]);
    setJournalDraft("");
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // 5-4-3-2-1 farkındalık egzersizi — isteğe bağlı, her adım atlanabilir.
  // null = başlamadı, 0..steps.length-1 = aktif adım, steps.length = bitti.
  const [groundingStep, setGroundingStep] = useState<number | null>(null);
  const groundingStarted = groundingStep !== null;
  const groundingDone = groundingStep !== null && groundingStep >= t.grounding.steps.length;

  const startGrounding = () => setGroundingStep(0);
  const nextGroundingStep = () =>
    setGroundingStep((s) => (s === null ? 0 : Math.min(s + 1, t.grounding.steps.length)));
  const restartGrounding = () => setGroundingStep(0);
  const stopGrounding = () => setGroundingStep(null);

  return (
    <div className="section support-page">
      <div className="container support-container">
        <header className="support-head">
          <span className="section-label">{t.label}</span>
          <h1
            className="section-title"
            style={{ maxWidth: 640 }}
            dangerouslySetInnerHTML={{ __html: t.title }}
          />
          <p className="section-sub">{t.subtitle}</p>
        </header>

        {/* Acil durum bölümü — her zaman görünür ve en üstte, kolayca ulaşılabilir. */}
        <section className="support-emergency" aria-labelledby="support-emergency-title">
          <h2 id="support-emergency-title" className="support-emergency-title">
            {t.emergency.title}
          </h2>
          <p className="support-emergency-text">{t.emergency.text}</p>
          <ul className="support-emergency-list">
            <li>{t.emergency.trText}</li>
            <li>{t.emergency.otherText}</li>
            <li>{t.emergency.trustedText}</li>
          </ul>
          <p className="support-emergency-note">{t.emergency.appNote}</p>
        </section>

        {/* 1) Duygu durumu seçimi */}
        <section className="support-block" aria-labelledby="support-moods-title">
          <h2 id="support-moods-title" className="support-block-title">
            {t.moods.title}
          </h2>
          <p className="support-block-subtitle">{t.moods.subtitle}</p>

          <div className="support-mood-grid" role="group" aria-label={t.moods.title}>
            {t.moods.items.map((mood) => (
              <button
                key={mood.key}
                type="button"
                onClick={() => setSelectedMoodKey(mood.key)}
                aria-pressed={selectedMoodKey === mood.key}
                className={`support-mood-btn${selectedMoodKey === mood.key ? " support-mood-btn--active" : ""}`}
              >
                <span className="support-mood-emoji" aria-hidden="true">{mood.emoji}</span>
                <span>{mood.label}</span>
              </button>
            ))}
          </div>

          {selectedMood && (
            <div className="support-mood-suggestion" role="status">
              <p>{selectedMood.suggestion}</p>
            </div>
          )}
        </section>

        {/* 2) Oturumluk günlük */}
        <section className="support-block" aria-labelledby="support-journal-title">
          <h2 id="support-journal-title" className="support-block-title">
            {t.journal.title}
          </h2>
          <p className="support-block-subtitle">{t.journal.subtitle}</p>

          <div className="support-journal-editor">
            <label htmlFor="support-journal-textarea" className="sr-only">
              {t.journal.title}
            </label>
            <textarea
              id="support-journal-textarea"
              className="support-journal-textarea"
              placeholder={t.journal.placeholder}
              value={journalDraft}
              maxLength={JOURNAL_MAX_CHARS}
              onChange={(e) => setJournalDraft(e.target.value)}
              rows={5}
            />
            <div className="support-journal-editor-row">
              <span className="support-journal-count">
                {journalDraft.length} / {JOURNAL_MAX_CHARS} {t.journal.charCount}
              </span>
              <button
                type="button"
                className="btn btn-outline"
                onClick={addJournalEntry}
                disabled={!journalDraft.trim()}
              >
                {t.journal.addLabel}
              </button>
            </div>
          </div>

          <ul className="support-journal-list">
            {journalEntries.length === 0 ? (
              <li className="support-journal-empty">{t.journal.emptyState}</li>
            ) : (
              journalEntries.map((entry) => (
                <li key={entry.id} className="support-journal-entry">
                  {/* Kullanıcı metni her zaman düz metin olarak render edilir; HTML çalıştırılmaz. */}
                  <p className="support-journal-entry-text">{entry.text}</p>
                  <button
                    type="button"
                    className="support-journal-delete"
                    onClick={() => deleteJournalEntry(entry.id)}
                    aria-label={t.journal.deleteLabel}
                  >
                    {t.journal.deleteLabel}
                  </button>
                </li>
              ))
            )}
          </ul>

          <p className="support-journal-privacy">
            {t.journal.privacyNote} {t.journal.sessionNote}
          </p>
        </section>

        {/* 3) 5-4-3-2-1 farkındalık egzersizi */}
        <section className="support-block" aria-labelledby="support-grounding-title">
          <h2 id="support-grounding-title" className="support-block-title">
            {t.grounding.title}
          </h2>
          <p className="support-block-subtitle">{t.grounding.subtitle}</p>

          {!groundingStarted && (
            <button type="button" className="btn btn-primary" onClick={startGrounding}>
              {t.grounding.startLabel}
            </button>
          )}

          {groundingStarted && !groundingDone && groundingStep !== null && (
            <div className="support-grounding-card">
              <span className="support-grounding-count">{t.grounding.steps[groundingStep].count}</span>
              <h3 className="support-grounding-sense">{t.grounding.steps[groundingStep].sense}</h3>
              <p className="support-grounding-prompt">{t.grounding.steps[groundingStep].prompt}</p>
              <div className="support-grounding-actions">
                <button type="button" className="btn btn-ghost" onClick={stopGrounding}>
                  {t.grounding.skipLabel}
                </button>
                <button type="button" className="btn btn-primary" onClick={nextGroundingStep}>
                  {t.grounding.nextLabel}
                </button>
              </div>
            </div>
          )}

          {groundingDone && (
            <div className="support-grounding-card support-grounding-card--done">
              <h3 className="support-grounding-sense">{t.grounding.doneTitle}</h3>
              <p className="support-grounding-prompt">{t.grounding.doneText}</p>
              <div className="support-grounding-actions">
                <button type="button" className="btn btn-outline" onClick={restartGrounding}>
                  {t.grounding.restartLabel}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 4) Profesyonel destek */}
        <section className="support-block" aria-labelledby="support-professional-title">
          <h2 id="support-professional-title" className="support-block-title">
            {t.professional.title}
          </h2>
          <p className="support-block-subtitle">{t.professional.text}</p>
          <a
            href={t.professional.linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            {t.professional.linkLabel}
          </a>
        </section>

        <p className="support-disclaimer">{t.disclaimer}</p>
      </div>
    </div>
  );
}
