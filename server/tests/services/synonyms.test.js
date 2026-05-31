'use strict';
process.env.NODE_ENV = 'test';

const { expandKeywords, augmentQueryForEmbedding } = require('../../services/synonyms');

// ── expandKeywords ─────────────────────────────────────────────────────────────

describe('expandKeywords', () => {
    it('expands a known IB Chemistry term to its synonyms', () => {
        const result = expandKeywords(['sn2'], 'SN2 reaction mechanism');
        expect(result).toContain('sn2');
        expect(result.some(t => t.includes('nucleophilic substitution'))).toBe(true);
        expect(result.some(t => t.includes('walden inversion'))).toBe(true);
    });

    it('matches a multi-word phrase from the original query and expands it', () => {
        const keywords = ['post-transcriptional', 'modification'];
        const result = expandKeywords(keywords, 'post-transcriptional modification of pre-mRNA');
        expect(result).toContain('rna processing');
        expect(result).toContain('intron removal');
        expect(result).toContain('mature mrna');
    });

    it('does not trigger MS synonym expansion on ordinary words containing those letters', () => {
        // "the terms of the equation" contains "ms" only inside "terms" — boundary guard must block it
        const result = expandKeywords(['terms', 'equation'], 'the terms of the equation');
        const hasMassSpecSynonym = result.some(t =>
            t.includes('mass spec') || t.includes('m/z') || t.includes('molecular ion')
        );
        expect(hasMassSpecSynonym).toBe(false);
    });

    it('always includes all original keywords in the output', () => {
        const keywords = ['entropy', 'gibbs', 'temperature'];
        const result = expandKeywords(keywords, 'entropy and gibbs temperature');
        for (const kw of keywords) {
            expect(result).toContain(kw);
        }
    });

    it('expands a single-token Economics abbreviation (PED) to its synonyms', () => {
        const result = expandKeywords(['ped'], 'PED and demand curves');
        expect(result).toContain('elastic demand');
        expect(result).toContain('inelastic demand');
        expect(result.some(t => t.includes('price elasticity of demand'))).toBe(true);
    });

    it('returns original keywords unchanged when no IB terms are present', () => {
        const keywords = ['hello', 'world'];
        const result = expandKeywords(keywords, 'hello world');
        expect(result).toEqual(keywords);
    });
});

// ── augmentQueryForEmbedding ───────────────────────────────────────────────────

describe('augmentQueryForEmbedding', () => {
    it('appends synonym clause for a recognised IB term', () => {
        const query = 'Explain SN2 reactions in organic chemistry';
        const result = augmentQueryForEmbedding(query);
        expect(result).toMatch(/^Explain SN2 reactions in organic chemistry \(also:/);
        expect(result).toMatch(/nucleophilic substitution/i);
    });

    it('appends synonyms for a multi-word IB Biology phrase', () => {
        const query = 'Describe post-transcriptional modification';
        const result = augmentQueryForEmbedding(query);
        expect(result).toMatch(/\(also:.*rna processing/i);
    });

    it('returns the original query unchanged when no IB terms are matched', () => {
        const query = 'What time does the library open on weekdays';
        const result = augmentQueryForEmbedding(query);
        expect(result).toBe(query);
    });

    it('does not append synonyms that already appear in the query', () => {
        // Query already contains both "sn2" and "nucleophilic substitution"
        const query = 'SN2 nucleophilic substitution bimolecular backside attack walden inversion';
        const result = augmentQueryForEmbedding(query);
        // Nothing new to add, so query is returned as-is
        expect(result).toBe(query);
    });

    it('limits appended synonyms to 8 terms', () => {
        // SA node has many synonyms — output must not exceed 8 additional terms
        const query = 'sinoatrial node function';
        const result = augmentQueryForEmbedding(query);
        if (result.includes('(also:')) {
            const clause = result.match(/\(also: (.+)\)$/)[1];
            const terms = clause.split(', ');
            expect(terms.length).toBeLessThanOrEqual(8);
        }
    });
});
