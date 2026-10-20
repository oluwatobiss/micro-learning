import React from 'react';
import { Link } from 'react-router';

export default function StudioRoute() {
  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Creator Studio</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Transform long-form educational material into interactive micro-learning lessons.
      </p>
      <Link 
        to="/" 
        style={{ 
          padding: '0.65rem 1.25rem', 
          backgroundColor: 'var(--accent-primary)', 
          color: 'var(--text-inverted)', 
          borderRadius: 'var(--radius-md)', 
          fontWeight: 600 
        }}
      >
        ← Back to Lessons
      </Link>
    </div>
  );
}
