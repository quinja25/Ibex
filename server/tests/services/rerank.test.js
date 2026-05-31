'use strict';
process.env.NODE_ENV = 'test';

const CHUNKS = [
  { source: 'wiki', sourceId: 1, title: 'A', content: 'alpha content', metadata: {}, score: 0.9 },
  { source: 'wiki', sourceId: 2, title: 'B', content: 'beta content',  metadata: {}, score: 0.7 },
  { source: 'wiki', sourceId: 3, title: 'C', content: 'gamma content', metadata: {}, score: 0.5 },
];

const resetEnv = () => {
  delete process.env.RAG_RERANK_PROVIDER;
  delete process.env.COHERE_API_KEY;
  delete process.env.OLLAMA_BASE_URL;
  delete process.env.RAG_RERANK_MODEL;
};

beforeEach(() => {
  resetEnv();
  jest.resetModules();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

const load = () => require('../../services/rerank');

describe('rerank — off / pass-through cases', () => {
  it('off mode: returns input verbatim, no fetch', async () => {
    process.env.RAG_RERANK_PROVIDER = 'off';
    const { rerank } = load();
    const result = await rerank('what is alpha', CHUNKS);
    expect(result).toBe(CHUNKS);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('default (no env): returns input verbatim, no fetch', async () => {
    const { rerank } = load();
    const result = await rerank('what is alpha', CHUNKS);
    expect(result).toBe(CHUNKS);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fewer than 2 chunks: returns input verbatim, no fetch', async () => {
    process.env.RAG_RERANK_PROVIDER = 'cohere';
    process.env.COHERE_API_KEY = 'key-xyz';
    const { rerank } = load();
    const single = [CHUNKS[0]];
    const result = await rerank('what is alpha', single);
    expect(result).toBe(single);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('empty query: returns input verbatim, no fetch', async () => {
    process.env.RAG_RERANK_PROVIDER = 'cohere';
    process.env.COHERE_API_KEY = 'key-xyz';
    const { rerank } = load();
    const result = await rerank('', CHUNKS);
    expect(result).toBe(CHUNKS);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('rerank — cohere happy path', () => {
  it('POSTs correct body and reorders chunks with rerankScore', async () => {
    process.env.RAG_RERANK_PROVIDER = 'cohere';
    process.env.COHERE_API_KEY = 'test-cohere-key';
    const { rerank } = load();

    // API says chunk index 2 is most relevant, then 0, then 1
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { index: 2, relevance_score: 0.95 },
          { index: 0, relevance_score: 0.80 },
          { index: 1, relevance_score: 0.60 },
        ],
      }),
    });

    const result = await rerank('gamma query', CHUNKS, { topN: 3 });

    // Verify POST body
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe('https://api.cohere.com/v2/rerank');
    expect(opts.method).toBe('POST');
    const body = JSON.parse(opts.body);
    expect(body.query).toBe('gamma query');
    expect(body.documents).toEqual(CHUNKS.map(c => c.content));
    expect(body.top_n).toBe(3);
    expect(body.model).toBe('rerank-english-v3.0');

    // Verify reordering and rerankScore
    expect(result[0].sourceId).toBe(3);
    expect(result[0].rerankScore).toBeCloseTo(0.95);
    expect(result[1].sourceId).toBe(1);
    expect(result[1].rerankScore).toBeCloseTo(0.80);
    expect(result[2].sourceId).toBe(2);
    expect(result[2].rerankScore).toBeCloseTo(0.60);
  });

  it('uses chunks.length as top_n when options.topN omitted', async () => {
    process.env.RAG_RERANK_PROVIDER = 'cohere';
    process.env.COHERE_API_KEY = 'test-cohere-key';
    const { rerank } = load();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: CHUNKS.map((_, i) => ({ index: i, relevance_score: 0.5 })),
      }),
    });

    await rerank('some query', CHUNKS);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.top_n).toBe(CHUNKS.length);
  });
});

describe('rerank — cohere error paths', () => {
  it('missing API key: returns input unchanged, no fetch', async () => {
    process.env.RAG_RERANK_PROVIDER = 'cohere';
    // COHERE_API_KEY intentionally not set
    const { rerank } = load();
    const result = await rerank('some query', CHUNKS);
    expect(result).toBe(CHUNKS);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('non-200 response: returns input unchanged', async () => {
    process.env.RAG_RERANK_PROVIDER = 'cohere';
    process.env.COHERE_API_KEY = 'test-key';
    const { rerank } = load();

    global.fetch.mockResolvedValueOnce({ ok: false, status: 429 });

    const result = await rerank('some query', CHUNKS);
    expect(result).toBe(CHUNKS);
  });

  it('network throw: returns input unchanged', async () => {
    process.env.RAG_RERANK_PROVIDER = 'cohere';
    process.env.COHERE_API_KEY = 'test-key';
    const { rerank } = load();

    global.fetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const result = await rerank('some query', CHUNKS);
    expect(result).toBe(CHUNKS);
  });

  it('malformed payload (no results array): returns input unchanged', async () => {
    process.env.RAG_RERANK_PROVIDER = 'cohere';
    process.env.COHERE_API_KEY = 'test-key';
    const { rerank } = load();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unexpected: true }),
    });

    const result = await rerank('some query', CHUNKS);
    expect(result).toBe(CHUNKS);
  });
});

// ── rerank — openai path ───────────────────────────────────────────────────────

describe('rerank — openai provider', () => {
  // Helper: reset modules, install openai mock, then load rerank with PROVIDER=openai
  const loadWithOpenAIMock = (mockFn) => {
    jest.resetModules();
    jest.doMock('../../services/openai', () => ({ chatCompletion: mockFn }));
    process.env.RAG_RERANK_PROVIDER = 'openai';
    return require('../../services/rerank');
  };

  afterEach(() => {
    jest.dontMock('../../services/openai');
  });

  it('reorders chunks according to scores returned by chatCompletion', async () => {
    const mockChat = jest.fn().mockResolvedValue({
      // scores: chunk 0 = 0.2, chunk 1 = 0.9, chunk 2 = 0.5 → expected order: 1, 2, 0
      content: '[0.2, 0.9, 0.5]',
    });
    const { rerank } = loadWithOpenAIMock(mockChat);

    const result = await rerank('some query', CHUNKS, { topN: 3 });

    expect(mockChat).toHaveBeenCalledTimes(1);
    expect(result[0].sourceId).toBe(2);   // score 0.9
    expect(result[0].rerankScore).toBeCloseTo(0.9);
    expect(result[1].sourceId).toBe(3);   // score 0.5
    expect(result[1].rerankScore).toBeCloseTo(0.5);
    expect(result[2].sourceId).toBe(1);   // score 0.2
    expect(result[2].rerankScore).toBeCloseTo(0.2);
  });

  it('slices output to topN after sorting', async () => {
    const mockChat = jest.fn().mockResolvedValue({ content: '[0.1, 0.8, 0.5]' });
    const { rerank } = loadWithOpenAIMock(mockChat);

    const result = await rerank('some query', CHUNKS, { topN: 2 });

    expect(result).toHaveLength(2);
    expect(result[0].sourceId).toBe(2);   // highest score 0.8
    expect(result[1].sourceId).toBe(3);   // second 0.5
  });

  it('falls back to input when chatCompletion throws', async () => {
    const mockChat = jest.fn().mockRejectedValue(new Error('API timeout'));
    const { rerank } = loadWithOpenAIMock(mockChat);

    const result = await rerank('some query', CHUNKS, { topN: 3 });

    expect(result).toBe(CHUNKS);
  });

  it('falls back to input when chatCompletion returns invalid JSON', async () => {
    const mockChat = jest.fn().mockResolvedValue({ content: 'not json at all' });
    const { rerank } = loadWithOpenAIMock(mockChat);

    const result = await rerank('some query', CHUNKS, { topN: 3 });

    expect(result).toBe(CHUNKS);
  });

  it('falls back to input when chatCompletion returns a non-array JSON value', async () => {
    const mockChat = jest.fn().mockResolvedValue({ content: '{"scores": [0.1, 0.2]}' });
    const { rerank } = loadWithOpenAIMock(mockChat);

    const result = await rerank('some query', CHUNKS, { topN: 3 });

    expect(result).toBe(CHUNKS);
  });
});

// ── rerank — edge cases ────────────────────────────────────────────────────────

describe('rerank — edge cases', () => {
  it('returns empty array immediately for empty chunks input', async () => {
    process.env.RAG_RERANK_PROVIDER = 'cohere';
    process.env.COHERE_API_KEY = 'test-key';
    const { rerank } = load();

    const result = await rerank('some query', []);
    expect(result).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns all chunks when topN exceeds chunks length (cohere)', async () => {
    process.env.RAG_RERANK_PROVIDER = 'cohere';
    process.env.COHERE_API_KEY = 'test-key';
    const { rerank } = load();

    // Cohere returns exactly 3 results even though topN=10
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { index: 0, relevance_score: 0.9 },
          { index: 1, relevance_score: 0.7 },
          { index: 2, relevance_score: 0.5 },
        ],
      }),
    });

    const result = await rerank('some query', CHUNKS, { topN: 10 });
    expect(result).toHaveLength(3);
  });
});
