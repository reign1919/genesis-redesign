import { describe, it, expect } from 'vitest';
import { SPONSORS } from './sponsorsData';

describe('sponsorsData', () => {
  it('contains exactly 6 official sponsors', () => {
    expect(SPONSORS).toHaveLength(6);
  });

  it('has all required fields for each sponsor', () => {
    SPONSORS.forEach((sponsor) => {
      expect(sponsor.id).toBeDefined();
      expect(sponsor.name).toBeDefined();
      expect(sponsor.role).toBeDefined();
      expect(sponsor.logo).toBeDefined();
      expect(sponsor.website).toMatch(/^https:\/\//);
      expect(sponsor.description).toBeTruthy();
    });
  });

  it('includes exact official names', () => {
    const names = SPONSORS.map((s) => s.name);
    expect(names).toContain('StudyIn');
    expect(names).toContain('n8n');
    expect(names).toContain('.xyz');
    expect(names).toContain('91.9 Friends FM');
    expect(names).toContain('The Telegraph: Young Metro');
    expect(names).toContain('React Kolkata');
  });
});
