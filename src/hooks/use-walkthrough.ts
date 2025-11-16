import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'paeasybooks.walkthrough.v1';

type StoredState = {
  completed: boolean;
  step: number;
};

export function useWalkthrough() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: StoredState = JSON.parse(raw);
        if (!data.completed) {
          setCurrentStep(data.step || 0);
          setIsOpen(true);
        }
      } else {
        // First-time users: open tutorial
        setIsOpen(true);
      }
    } catch {}
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: true, step: currentStep }));
    } catch {}
  }, [currentStep]);

  const setStep = useCallback((idx: number) => {
    setCurrentStep(idx);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: false, step: idx }));
    } catch {}
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: false, step: 0 }));
    } catch {}
  }, []);

  return { isOpen, currentStep, setCurrentStep: setStep, close, reset };
}
