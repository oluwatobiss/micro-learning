import React from "react";
import { Link, useLocation } from "react-router";
import type { ThemeMode } from "../types/lesson";
import styles from "./Header.module.css";

interface HeaderProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const location = useLocation();
  const isStudio = location.pathname.startsWith("/studio");
  const isReaderHome = location.pathname === "/";

  return (
    <header className={styles.header} role="banner">
      <Link
        to="/"
        className={styles.brand}
        aria-label="MicroLearning Studio Home"
      >
        <div className={styles.logoIcon} aria-hidden="true">
          μ
        </div>
        <span className={styles.brandText}>MicroLearning Studio</span>
      </Link>

      <nav
        className={styles.nav}
        role="navigation"
        aria-label="Main Navigation"
      >
        <Link
          to="/"
          className={`${styles.navLink} ${isReaderHome ? styles.navLinkActive : ""}`}
        >
          Explore Lessons
        </Link>

        <Link
          to="/studio"
          className={`${styles.navLink} ${isStudio ? styles.navLinkActive : ""}`}
        >
          Creator Studio
        </Link>

        <div className={styles.themeSelectWrapper}>
          <select
            value={currentTheme}
            onChange={(e) => onThemeChange(e.target.value as ThemeMode)}
            className={styles.themeSelect}
            aria-label="Select color theme"
          >
            <option value="clean-light">Clean Light</option>
            <option value="focused-dark">Focused Dark</option>
            <option value="warm-editorial">Warm Editorial</option>
          </select>
        </div>
      </nav>
    </header>
  );
};
