import { useState, useEffect } from "react";
import Cookies from "js-cookie";

type Theme = "light" | "dark";

const THEME_COOKIE_NAME = "theme";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (Cookies.get(THEME_COOKIE_NAME) as Theme) || "dark";
  });

  useEffect(() => {
    Cookies.set(THEME_COOKIE_NAME, theme, { expires: 365 });
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return {
    theme,
    toggleTheme,
  };
};
