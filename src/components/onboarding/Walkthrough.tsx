'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

export type WalkthroughStep = {
  id: string;               // unique id
  target: string;           // CSS selector or [data-tour-id="..."]
  title: string;
  content: string;
  actionLabel?: string;
  onAction?: () => void;
};

export type WalkthroughProps = {
  steps: WalkthroughStep[];
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  setCurrentStep: (i: number) => void;
};

function getTargetRect(selector: string) {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return null;
  return el.getBoundingClientRect();
}

export function Walkthrough({ steps, isOpen, onClose, currentStep, setCurrentStep }: WalkthroughProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = steps[currentStep] || null;
  const overlayRef = useRef<HTMLDivElement>(null);

  const total = steps.length;

  useEffect(() => {
    if (!isOpen || !step) return;
    const r = getTargetRect(step.target);
    setRect(r);
    const handleResize = () => {
      const r2 = getTargetRect(step.target);
      setRect(r2);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isOpen, step]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentStep < total - 1) setCurrentStep(currentStep + 1);
      if (e.key === 'ArrowLeft' && currentStep > 0) setCurrentStep(currentStep - 1);
    }
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, currentStep, total, onClose, setCurrentStep]);

  if (!isOpen || !step) return null;

  const padding = 8;
  const highlight = rect
    ? {
        top: window.scrollY + rect.top - padding,
        left: window.scrollX + rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }
    : null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[1000] pointer-events-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Highlight box */}
      {highlight && (
        <div
          className="absolute border-2 border-white rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
            boxShadow: `0 0 0 9999px rgba(0,0,0,0.5)`
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute bg-white rounded-lg shadow-lg p-4 w-[320px] max-w-[90vw]"
        style={{
          top: (highlight?.top || window.scrollY + 80) + (highlight ? highlight.height + 12 : 0),
          left: highlight ? highlight.left : window.scrollX + 24,
        }}
      >
        <div className="text-xs text-gray-500 mb-1">Step {currentStep + 1} of {total}</div>
        <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
        <p className="text-sm text-gray-700 mt-1">{step.content}</p>
        <div className="flex items-center gap-2 mt-3">
          <button
            className="px-3 py-1.5 text-sm rounded bg-gray-100 hover:bg-gray-200"
            onClick={onClose}
          >
            Skip
          </button>
          {currentStep > 0 && (
            <button
              className="px-3 py-1.5 text-sm rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </button>
          )}
          {currentStep < total - 1 ? (
            <button
              className="ml-auto px-3 py-1.5 text-sm rounded bg-slate-900 text-white hover:bg-slate-800"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next
            </button>
          ) : (
            <button
              className="ml-auto px-3 py-1.5 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={onClose}
            >
              Finish
            </button>
          )}
          {step.onAction && (
            <button
              className="px-3 py-1.5 text-sm rounded border border-slate-300 hover:bg-slate-50"
              onClick={step.onAction}
            >
              {step.actionLabel || 'Open'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
