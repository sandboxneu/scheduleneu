import { Dispatch, useEffect, useState } from "react";

/**
 * Enum declared to be able to look up usages of storage keys and ensures
 * the keys are unique.
 */
export enum LocalStorageKey {
  // Delete later, this is for testing.
  Token = "Token",
}

/**
 * Using this hook allows for any component to access localstorage.
 * Accessing the hook allows for the functionality of setting and getting a value in localstorage.
 * @param key Key for the localstorage value.
 * @param defaultValue Default value returned if the hook cannot access the value in localstorage.
 */
export function useLocalStorage<T>(
  key: LocalStorageKey,
  defaultValue: T
): [T, Dispatch<T>] {
  const [storedValue, setStoredValue] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) setStoredValue(JSON.parse(item));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window?.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  // TODO: add removeValue function

  return [storedValue, setValue];
}
