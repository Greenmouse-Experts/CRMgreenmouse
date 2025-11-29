import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

let theme_atom = atomWithStorage<"light" | "dark">("theme", "dark");

export const useTheme = () => {
  const [theme, setTheme] = useAtom(theme_atom);
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      return prevTheme === "light" ? "dark" : "light";
    });
  };
  return {
    theme,
    toggleTheme,
  };
};
