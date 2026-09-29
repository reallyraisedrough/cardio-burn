"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ChromeValue = {
  hideNav: boolean;
  setHideNav: (hide: boolean) => void;
};

const ChromeContext = createContext<ChromeValue>({
  hideNav: false,
  setHideNav: () => {},
});

export function useChrome() {
  return useContext(ChromeContext);
}

export function ChromeProvider({ children }: { children: ReactNode }) {
  const [hideNav, setHideNav] = useState(false);
  const value = useMemo(() => ({ hideNav, setHideNav }), [hideNav]);
  return (
    <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>
  );
}
