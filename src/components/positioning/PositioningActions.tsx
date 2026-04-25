'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChangeCategory } from '@/types/positioning';

/*
  PositioningActions — client component for approve / request-changes flow.
  60-second client-side undo window before approve POST is fired.
  No DB write happens until the timer expires.

  Built: 2026-04-24 under RADLEY APPROVED — RTI PHASE 0 → 1
*/

const D = {
  navy: '#0A1929',
  teal: '#00BFA6',
  red: '#EF4444',
  gold: '#D4A830',
  grayMid: '#f1f5f9',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  border: '#e2e8f0',
  white: '#ffffff',
};

const CHANGE_OPTIONS: Array<{ value: ChangeCategory; label: string }> = [
  { value: 'markets', label: 'Markets' },
  { value: 'pillar_1', label: 'Pillar 1 — Pricing' },
  { value: 'pillar_2', label: 'Pillar 2 — Process' },
  { value: 'stat_accuracy', label: 'Stat accuracy' },
  { value: 'tone_voice', label: 'Tone / voice' },
  { value: 'other', label: 'Other' },
];

const UNDO_WINDOW_SECONDS = 60;

type ApprovalState =
  | { kind: 'idle' }
  | { kind: 'undo_window'; secondsLeft: number; cancelTimer: () => void }
  | { kind: 'submitting' }
  | { kind: 'approved'; approvedAt: string }
  | { kind: 'changes_form' }
  | { kind: 'changes_submitting' }
  | { kind: 'changes_submitted'; retryCount: number }
  | { kind: 'error'; message: string };

interface Props {
  slug: string;
  token: string;
  version: string;
  initialStatus: 'pending' | 'approved' | 'changes_requested';
  approvedAt?: string | null;
}

export default function PositioningActions({ slug, token, version, initialStatus, approvedAt }: Props) {
  // If already in a terminal state, render the terminal UI
  const [state, setState] = useState<ApprovalState>(() => {
    if (initialStatus === 'approved' && approvedAt) {
      return { kind: 'approved', approvedAt };
    }
    return { kind: 'idle' };
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startApprove() {
    let secondsLeft = UNDO_WINDOW_SECONDS;
    let canceled = false;

    const cancelTimer = () => {
      canceled = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState({ kind: 'idle' });
    };

    timerRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (canceled) return;
      if (secondsLeft <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        commitApprove();
      } else {
        setState({ kind: 'undo_window', secondsLeft, cancelTimer });
      }
    }, 1000);

    setState({ kind: 'undo_window', secondsLeft, cancelTimer });
  }

  async function commitApprove() {
    setState({ kind: 'submitting' });
    try {
      const res = await fetch('/api/positioning/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, token, version }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data.message ||
          data.error ||
          `Approval failed (${res.status}). Please refresh and try again.`;
        setState({ kind: 'error', message: msg });
        return;
      }
      const data = await res.json();
      setState({ kind: 'approved', approvedAt: data.approved_at });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Network error';
      setState({ kind: 'error', message: msg });
    }
  }

  function openChangesForm() {
    setState({ kind: 'changes_form' });
  }

  async function submitChanges(categories: ChangeCategory[], notes: string) {
    if (categories.length === 0) {
      setState({ kind: 'error', message: 'Select at least one category before submitting' });
      return;
    }
    if (categories.includes('other') && notes.trim().length === 0) {
      setState({ kind: 'error', message: 'Notes are required when "Other" is selected' });
      return;
    }
    setState({ kind: 'changes_submitting' });
    try {
      const res = await fetch('/api/positioning/request-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, token, version, categories, notes }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setState({ kind: 'error', message: data.error || `Submission failed (${res.status})` });
        return;
      }
      const data = await res.json();
      setState({ kind: 'changes_submitted', retryCount: data.retry_count });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Network error';
      setState({ kind: 'error', message: msg });
    }
  }

  // ─── Render by state ───
  if (state.kind === 'approved') {
    return (
      <div style={successCardStyle}>
        <div style={successHeadingStyle}>✅ Approved</div>
        <p style={successBodyStyle}>
          Your positioning is locked. Radley has been notified and will trigger Copy Kit generation when ready. You'll receive your platform-specific drafts to review next.
        </p>
        <p style={successMetaStyle}>Approved: {new Date(state.approvedAt).toLocaleString()}</p>
      </div>
    );
  }

  if (state.kind === 'changes_submitted') {
    return (
      <div style={successCardStyle}>
        <div style={successHeadingStyle}>📝 Changes Requested</div>
        <p style={successBodyStyle}>
          Your edits have been logged and Radley has been notified. He'll review your feedback and update your positioning. You'll be invited back to review the updated version.
        </p>
        <p style={successMetaStyle}>Revision #{state.retryCount}</p>
      </div>
    );
  }

  if (state.kind === 'undo_window') {
    return (
      <div style={undoCardStyle}>
        <div style={undoHeadingStyle}>Approving in {state.secondsLeft}s</div>
        <p style={undoBodyStyle}>
          Approval will commit when the countdown ends. Click cancel to stop.
        </p>
        <button type="button" onClick={state.cancelTimer} style={cancelButtonStyle}>
          Cancel approval
        </button>
      </div>
    );
  }

  if (state.kind === 'submitting' || state.kind === 'changes_submitting') {
    return (
      <div style={submittingCardStyle}>
        <p>Submitting…</p>
      </div>
    );
  }

  if (state.kind === 'changes_form') {
    return <ChangesForm onSubmit={submitChanges} onCancel={() => setState({ kind: 'idle' })} />;
  }

  // idle (or error → still show idle actions plus error banner)
  return (
    <div>
      {state.kind === 'error' && (
        <div style={errorBannerStyle}>
          ⚠️ {state.message}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button type="button" onClick={startApprove} style={approveButtonStyle}>
          Approve as-is
        </button>
        <button type="button" onClick={openChangesForm} style={requestChangesButtonStyle}>
          Request changes
        </button>
      </div>

      <p style={{ fontSize: '13px', color: D.textSecondary, lineHeight: '1.55', marginBottom: 0 }}>
        Approval includes a 60-second undo window before it commits. Once committed, Radley reviews and triggers Copy Kit generation manually.
      </p>
    </div>
  );
}

// ─── ChangesForm subcomponent ───
function ChangesForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (categories: ChangeCategory[], notes: string) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<Set<ChangeCategory>>(new Set());
  const [notes, setNotes] = useState('');

  function toggle(value: ChangeCategory) {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSelected(next);
  }

  return (
    <div>
      <p style={{ fontSize: '14px', color: D.navy, fontWeight: 600, marginBottom: '12px' }}>
        What would you like to change?
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        {CHANGE_OPTIONS.map((option) => (
          <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: D.navy, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selected.has(option.value)}
              onChange={() => toggle(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={`Be specific. Example: "Change the 86% stat to 84% — I just relisted one that reduced."`}
        style={{
          width: '100%',
          minHeight: '110px',
          padding: '14px',
          border: `1.5px solid ${D.border}`,
          borderRadius: '10px',
          fontSize: '14px',
          fontFamily: 'inherit',
          color: D.navy,
          resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
        <button
          type="button"
          onClick={() => onSubmit(Array.from(selected), notes)}
          disabled={selected.size === 0}
          style={{
            ...approveButtonStyle,
            opacity: selected.size === 0 ? 0.5 : 1,
            cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Submit changes
        </button>
        <button type="button" onClick={onCancel} style={requestChangesButtonStyle}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Styles ───
const approveButtonStyle: React.CSSProperties = {
  padding: '14px 28px',
  background: D.gold,
  color: D.navy,
  border: 'none',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
};

const requestChangesButtonStyle: React.CSSProperties = {
  padding: '14px 28px',
  background: D.white,
  color: D.navy,
  border: `1.5px solid ${D.navy}`,
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: D.white,
  color: D.red,
  border: `1.5px solid ${D.red}`,
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const successCardStyle: React.CSSProperties = {
  background: D.white,
  border: `2px solid ${D.teal}`,
  borderRadius: '14px',
  padding: '24px 28px',
};
const successHeadingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: D.navy,
  marginBottom: '10px',
};
const successBodyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: D.textSecondary,
  lineHeight: '1.6',
  marginBottom: '8px',
};
const successMetaStyle: React.CSSProperties = {
  fontSize: '12px',
  color: D.textTertiary,
  marginBottom: 0,
};

const undoCardStyle: React.CSSProperties = {
  background: D.white,
  border: `2px solid ${D.gold}`,
  borderRadius: '14px',
  padding: '20px 24px',
};
const undoHeadingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: D.navy,
  marginBottom: '8px',
};
const undoBodyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: D.textSecondary,
  lineHeight: '1.55',
  marginBottom: '14px',
};

const submittingCardStyle: React.CSSProperties = {
  padding: '16px 20px',
  fontSize: '14px',
  color: D.textSecondary,
};

const errorBannerStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: '#FEE2E2',
  color: '#991B1B',
  border: '1px solid #FECACA',
  borderRadius: '8px',
  fontSize: '13px',
  marginBottom: '16px',
};
