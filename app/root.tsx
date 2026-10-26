import React, { useState, useEffect } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { ThemeMode } from "./types/lesson";
import { Header } from "./components/Header";
import "./root.css";

export function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("warm-editorial");

  useEffect(() => {
    const saved = localStorage.getItem("microlearning_theme") as ThemeMode;
    if (
      saved &&
      ["clean-light", "focused-dark", "warm-editorial"].includes(saved)
    ) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "warm-editorial");
    }
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem("microlearning_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <html lang="en" data-theme={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>
          MicroLearning Studio — Interactive Lessons from Long-Form Knowledge
        </title>
        <Meta />
        <Links />
      </head>
      <body>
        <Header currentTheme={theme} onThemeChange={handleThemeChange} />
        <main>{children}</main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
