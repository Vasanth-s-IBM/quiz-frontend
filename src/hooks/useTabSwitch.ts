/**
 * Custom hook for detecting tab switches (malpractice detection)
 */
import { useEffect, useState } from 'react';

export const useTabSwitch = (enabled: boolean, maxSwitches: number = 3) => {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);

        if (newCount === 1) {
          setWarningMessage('Warning: Tab switch detected! This is your first warning.');
          setShowWarning(true);
        } else if (newCount === 2) {
          setWarningMessage('Final Warning: One more tab switch will auto-submit your exam!');
          setShowWarning(true);
        } else if (newCount >= maxSwitches) {
          setWarningMessage('Exam auto-submitted due to malpractice detection.');
          setShowWarning(true);
          setShouldAutoSubmit(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, tabSwitchCount, maxSwitches]);

  const closeWarning = () => {
    setShowWarning(false);
  };

  return {
    tabSwitchCount,
    showWarning,
    warningMessage,
    closeWarning,
    shouldAutoSubmit,
  };
};
