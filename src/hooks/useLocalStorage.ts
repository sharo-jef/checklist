import { useState, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "@/utils/storage";

/**
 * LocalStorageと同期する状態管理フック
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === "undefined") {
      return;
    }

    try {
      const data = loadFromStorage();
      if (data) {
        setStoredValue(data as T);
      }
    } catch {
      // Error already logged by loadFromStorage utility
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      saveToStorage(valueToStore as any);
    } catch {
      // Error already logged by saveToStorage utility
    }
  };

  return [storedValue, setValue, isLoaded] as const;
}
