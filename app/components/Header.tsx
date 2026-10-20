import React from 'react';
import { Link, useLocation } from 'react-router';
import type { ThemeMode } from '../types/lesson';
import styles from './Header.module.css';

interface HeaderProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTheme, onThemeChange }) => {
  const location = useLocation();
  const isStudio = location.pathname.startsWith('/studio');
  const isReaderHome = location.pathname === '/';

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        <div className={styles.logoIcon}>μ</div>
        <span className={styles.brandText}>MicroLearning Studio</span>
      </Link>

      <nav className={styles.nav}>
        <Link
          to="/"
          className={`${styles.navLink} ${isReaderHome ? styles.navLinkActive : ''}`}
        >
          Explore Lessons
        </Link>

        <Link
          to="/studio"
          className={`${styles.navLink} ${isStudio ? styles.navLinkActive : ''}`}
        >
          Creator Studio
        </Link>

        <select
          value={currentTheme}
          onChange={(e) => onThemeChange(e.target.value as ThemeMode)}
          className={styles.themeSelect}
          aria-label="Theme selector"
        >
          <option value="clean-light">Clean Light</option>
          <option value="focused-dark">Focused Dark</option>
          <option value="warm-editorial">Warm Editorial</option>
        </select>
      </nav>
    </header>
  );
};
