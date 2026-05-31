'use strict';

const PROVIDER = (process.env.RAG_RERANK_PROVIDER || 'off').toLowerCase();
const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.RAG_RERANK_MODEL || 'bge-reranker-base';
const { chatCompletion } = require('./openai');

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

async function rerankCohere(query, chunks, topN) {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    console.error('[rerank] COHERE_API_KEY not set — skipping rerank');
    return chunks;
  }

  let res;
  try {
    res = await fetch('https://api.cohere.com/v2/rerank', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'rerank-english-v3.0',
        query,
        documents: chunks.map(c => c.content),
        top_n: topN,
      }),
    });
  } catch (err) {
    console.error('[rerank] cohere fetch error:', err.message);
    return chunks;
  }

  if (!res.ok) {
    console.error('[rerank] cohere non-200:', res.status);
    return chunks;
  }

  let body;
  try {
    body = await res.json();
  } catch (err) {
    console.error('[rerank] cohere bad JSON:', err.message);
    return chunks;
  }

  if (!Array.isArray(body?.results)) {
    console.error('[rerank] cohere unexpected payload shape');
    return chunks;
  }

  return body.results.map(r => ({
    ...chunks[r.index],
    rerankScore: r.relevance_score,
  }));
}

// Ollama lacks a true cross-encoder; we embed query + each chunk and rank by cosine sim.
async function rerankOllama(query, chunks) {
  const embed = async (input) => {
    let res;
    try {
      res = await fetch(`${OLLAMA_BASE}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: OLLAMA_MODEL, input }),
      });
    } catch (err) {
      throw new Error(`ollama fetch: ${err.message}`);
    }
    if (!res.ok) throw new Error(`ollama status ${res.status}`);
    const data = await res.json();
    // /api/embed returns { embeddings: [[...]] }
    return data.embeddings?.[0] ?? data.embedding;
  };

  let queryVec;
  try {
    queryVec = await embed(query);
  } catch (err) {
    console.error('[rerank] ollama query embed error:', err.message);
    return chunks;
  }

  const scored = [];
  for (const chunk of chunks) {
    try {
      const vec = await embed(chunk.content);
      scored.push({ ...chunk, rerankScore: cosine(queryVec, vec) });
    } catch (err) {
      console.error('[rerank] ollama chunk embed error:', err.message);
      return chunks;
    }
  }

  return scored.sort((a, b) => b.rerankScore - a.rerankScore);
}

/**
 * OpenAI reranker — scores all candidates in a single batched gpt-4o-mini call.
 * Sends up to 20 chunks in one prompt; model returns a JSON array of 0–10 scores.
 * One API call total regardless of chunk count, so latency is ~300–600ms.
 */
async function rerankOpenAI(query, chunks, topN) {
  const passages = chunks
    .slice(0, 20)
    .map((c, i) => `[${i + 1}] ${(c.content || '').slice(0, 600)}`);

  const prompt = `You are a relevance judge for an IB student study platform.
Given the query and passages below, output a JSON array of relevance scores (0.0–1.0) in the same order as the passages. Output ONLY the JSON array, nothing else.

Query: ${query}

Passages:
${passages.join('\n\n')}`;

  let scores;
  try {
    const result = await chatCompletion(
      [{ role: 'user', content: prompt }],
      { temperature: 0, max_tokens: 200 }
    );
    scores = JSON.parse(result.content.trim());
    if (!Array.isArray(scores)) throw new Error('not an array');
  } catch (err) {
    console.error('[rerank] openai parse error:', err.message);
    return chunks;
  }

  return chunks
    .slice(0, 20)
    .map((c, i) => ({ ...c, rerankScore: typeof scores[i] === 'number' ? scores[i] : 0 }))
    .sort((a, b) => b.rerankScore - a.rerankScore)
    .slice(0, topN);
}

async function rerank(query, chunks, options = {}) {
  if (PROVIDER === 'off' || !query || chunks.length < 2) return chunks;

  const topN = options.topN || chunks.length;

  if (PROVIDER === 'cohere') return rerankCohere(query, chunks, topN);
  if (PROVIDER === 'ollama') return rerankOllama(query, chunks);
  if (PROVIDER === 'openai') return rerankOpenAI(query, chunks, topN);

  return chunks;
}

module.exports = { rerank };
