import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "solitaire-settings";

const DEFAULT_SETTINGS = {
  showHints: true,
};

export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to load settings:", e);
    }
    return DEFAULT_SETTINGS;
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed to save settings:", e);
    }
  }, [settings]);

  // Toggle hints
  const toggleHints = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      showHints: !prev.showHints,
    }));
  }, []);

  // Update a specific setting
  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return {
    settings,
    showHints: settings.showHints,
    toggleHints,
    updateSetting,
  };
};
