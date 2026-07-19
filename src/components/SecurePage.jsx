import { Link } from 'react-router-dom';
import NeuralBackground from './NeuralBackground';
import './SecurePage.css';

export default function SecurePage({ eyebrow, title, subtitle, action, children }) {
  return (
    <div className="secure-page">
      <div className="secure-page__background" aria-hidden="true">
        <NeuralBackground />
      </div>
      <div className="secure-page__grid" aria-hidden="true" />
      <header className="secure-page__tech-header">
        <Link to="/" aria-label="Go to the home page">GENESIS TECH FEST</Link>
        <a
          href="https://www.ivwschool.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit the Indus Valley World School website in a new tab"
        >
          INDUS VALLEY WORLD SCHOOL
        </a>
      </header>
      <main className="secure-page__container">
        <div className="secure-page__heading">
          <div>
            <p className="secure-page__eyebrow label-caps">{eyebrow}</p>
            <h1>{title}</h1>
            {subtitle && <p className="secure-page__subtitle">{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}
