/**
 * IB subject-specific synonym map for query expansion.
 *
 * Two uses:
 *   1. expandKeywords()        — widens FULLTEXT keyword list before MySQL search
 *   2. augmentQueryForEmbedding() — appends synonym terms to the query string
 *      before calling createEmbedding(), pulling the vector toward the broader
 *      topic neighbourhood (e.g. "post-transcriptional modification" → also
 *      embeds "RNA processing", "splicing", "intron removal")
 *
 * Each group is a set of interchangeable terms. The map is bidirectional:
 * matching any term in a group expands to all others.
 */

const RAW_MAP = {
    Chemistry: [
        ['SN2', 'nucleophilic substitution bimolecular', 'backside attack', 'walden inversion'],
        ['SN1', 'nucleophilic substitution unimolecular', 'carbocation intermediate'],
        ['photosystem II', 'PS II', 'PSII', 'photosystem 2', 'water splitting', 'photolysis'],
        ['photosystem I', 'PS I', 'PSI', 'photosystem 1', 'NADP reduction'],
        ['Le Chatelier', "le chatelier's principle", 'equilibrium shift', 'position of equilibrium'],
        ['Haber process', 'haber-bosch', 'ammonia synthesis', 'nitrogen to ammonia'],
        ['activation energy', 'Ea', 'energy barrier', 'minimum energy'],
        ['enthalpy', 'ΔH', 'delta H', 'heat of reaction', 'heat change'],
        ['entropy', 'ΔS', 'delta S', 'disorder', 'randomness'],
        ['Gibbs free energy', 'ΔG', 'delta G', 'spontaneity', 'spontaneous reaction'],
        ['oxidation state', 'oxidation number', 'valence state'],
        ['hydrogen bonding', 'H-bond', 'H bond', 'intermolecular hydrogen', 'hydrogen bond'],
        ['Maxwell-Boltzmann', 'Maxwell Boltzmann', 'kinetic energy distribution', 'energy distribution curve'],
        ['saponification', 'ester hydrolysis', 'base hydrolysis', 'alkaline hydrolysis'],
        ['NMR', 'nuclear magnetic resonance', '1H NMR', 'proton NMR', 'chemical shift', 'splitting pattern'],
        ['mass spectrometry', 'mass spec', 'MS', 'm/z ratio', 'molecular ion peak'],
        ['infrared spectroscopy', 'IR spectroscopy', 'IR spectrum', 'wavenumber', 'functional group identification'],
        ['degree of dissociation', 'ionisation', 'ionization', 'Ka', 'acid dissociation constant', 'weak acid equilibrium'],
        ['buffer solution', 'buffer', 'pH buffer', 'resist pH change'],
        ['Born-Haber cycle', 'lattice enthalpy', 'Born Haber', 'lattice energy'],
        ['electronegativity', 'electron negativity', 'EN', 'bond polarity'],
        ['hybridisation', 'hybridization', 'sp3', 'sp2', 'orbital overlap'],
        ['collision theory', 'collision frequency', 'effective collision', 'successful collision'],
        ['standard electrode potential', 'E°', 'EMF', 'cell potential', 'reduction potential'],
        ["Hess's law", 'hess law', 'enthalpy cycle', 'path independence'],
        ['strong acid', 'complete dissociation', 'fully ionised', 'HCl', 'H2SO4'],
        ['weak acid', 'partial dissociation', 'partially ionised', 'ethanoic acid', 'acetic acid'],
        ['redox', 'oxidation reduction', 'OIL RIG', 'electron transfer', 'half equation'],
        ['rate of reaction', 'reaction rate', 'kinetics', 'rate constant'],
        ['dynamic equilibrium', 'equilibrium constant', 'Kc', 'Kp', 'equilibrium expression'],
    ],
    Biology: [
        ['sinoatrial node', 'SA node', 'SAN', 'pacemaker', 'cardiac pacemaker'],
        ['atrioventricular node', 'AV node', 'AVN', 'bundle of His', 'Purkinje fibres'],
        ['post-transcriptional modification', 'RNA processing', 'pre-mRNA processing', 'mRNA splicing', 'RNA splicing', 'intron removal', 'exon joining', 'mature mRNA'],
        ['spliceosome', 'splicing complex', 'intron splicing'],
        ["5' cap", "5' methylguanosine cap", 'mRNA cap', 'methylguanosine'],
        ['poly-A tail', 'polyadenylation', "3' tail", 'poly A'],
        ['photosystem I', 'PS I', 'PSI', 'photosystem 1', 'NADPH production'],
        ['photosystem II', 'PS II', 'PSII', 'photosystem 2', 'water photolysis', 'oxygen evolution'],
        ['Calvin cycle', 'Calvin-Benson cycle', 'light-independent reactions', 'carbon fixation', 'CO2 fixation', 'RuBisCO'],
        ['light-dependent reactions', 'light reactions', 'photophosphorylation', 'thylakoid reactions'],
        ['glycolysis', 'glycolytic pathway', 'glucose breakdown', 'pyruvate production'],
        ['Krebs cycle', 'TCA cycle', 'citric acid cycle', 'tricarboxylic acid cycle'],
        ['oxidative phosphorylation', 'electron transport chain', 'ETC', 'chemiosmosis', 'ATP synthase'],
        ['fluid mosaic model', 'phospholipid bilayer', 'cell membrane structure', 'Singer-Nicolson'],
        ['semiconservative replication', 'DNA replication', 'leading strand', 'lagging strand', 'Okazaki fragments'],
        ['helicase', 'DNA unwinding', 'double helix unwinding'],
        ['DNA polymerase', 'nucleotide addition', 'template strand'],
        ['ligase', 'nick sealing', 'Okazaki fragment joining'],
        ['codominance', 'co-dominance', 'ABO blood group', 'blood type AB', 'I^A I^B'],
        ['natural selection', 'selection pressure', 'survival of the fittest', 'differential reproduction'],
        ['antibiotic resistance', 'drug resistance', 'bacterial resistance', 'resistant allele'],
        ['nitrogen fixation', 'nitrogen cycle', 'nitrification', 'denitrification', 'Rhizobium', 'Nitrosomonas', 'Nitrobacter'],
        ['translation', 'protein synthesis', 'ribosome function', 'polypeptide synthesis', 'codon reading'],
        ['transcription', 'mRNA synthesis', 'RNA polymerase', 'gene expression'],
        ['allele frequency', 'gene frequency', 'Hardy-Weinberg', 'population genetics'],
        ['action potential', 'nerve impulse', 'depolarisation', 'depolarization', 'resting potential'],
        ['trophic level', 'food chain', 'energy transfer ecology', 'food web'],
        ['carrying capacity', 'population growth', 'logistic growth', 'S-curve'],
        ['osmoregulation', 'kidney function', 'water potential', 'nephron'],
        ['homeostasis', 'negative feedback', 'thermoregulation', 'blood glucose regulation'],
    ],
    Economics: [
        ['price elasticity of demand', 'PED', 'demand elasticity', 'inelastic demand', 'elastic demand'],
        ['price elasticity of supply', 'PES', 'supply elasticity'],
        ['income elasticity of demand', 'YED', 'normal good', 'inferior good'],
        ['cross elasticity of demand', 'XED', 'substitute goods', 'complementary goods'],
        ['marginal propensity to consume', 'MPC', 'consumption function'],
        ['marginal propensity to save', 'MPS', 'savings rate'],
        ['Keynesian multiplier', 'multiplier effect', 'fiscal multiplier', 'injection multiplier'],
        ['aggregate demand', 'AD', 'total spending', 'AD curve'],
        ['aggregate supply', 'AS', 'total output', 'AS curve'],
        ['GDP', 'gross domestic product', 'national income', 'national output', 'economic output'],
        ['Human Development Index', 'HDI', 'development indicator', 'life expectancy education income'],
        ['purchasing power parity', 'PPP', 'real exchange rate comparison'],
        ['comparative advantage', 'Ricardo', 'opportunity cost trade', 'specialisation'],
        ['current account deficit', 'balance of payments deficit', 'trade deficit', 'CAD'],
        ['exchange rate', 'forex', 'foreign exchange', 'currency depreciation', 'currency appreciation'],
        ['expansionary fiscal policy', 'fiscal stimulus', 'government spending', 'tax cut'],
        ['contractionary fiscal policy', 'fiscal austerity', 'fiscal consolidation', 'deficit reduction'],
        ['quantitative easing', 'QE', 'monetary expansion', 'money supply increase'],
        ['demand-pull inflation', 'demand inflation', 'excess demand', 'inflationary gap'],
        ['cost-push inflation', 'supply-side inflation', 'cost inflation', 'oil price shock'],
        ['stagflation', 'stagnation and inflation', 'supply shock'],
        ['Phillips curve', 'unemployment inflation tradeoff', 'NAIRU'],
        ['negative externality', 'external cost', 'social cost', 'pollution tax', 'market failure'],
        ['positive externality', 'external benefit', 'social benefit', 'subsidy'],
        ['public good', 'non-excludable', 'non-rival', 'free rider problem'],
        ['monopoly', 'market power', 'price maker', 'deadweight loss', 'supernormal profit'],
        ['oligopoly', 'game theory', 'collusion', 'cartel', 'kinked demand curve'],
        ['perfect competition', 'price taker', 'allocative efficiency', 'productive efficiency'],
        ['Lorenz curve', 'Gini coefficient', 'income inequality', 'wealth distribution'],
        ['microfinance', 'microcredit', 'Grameen Bank', 'small loans', 'financial inclusion'],
        ['absolute poverty', 'poverty line', 'extreme poverty', '$1.90 a day'],
        ['relative poverty', 'income inequality', 'relative deprivation'],
        ['protectionism', 'tariff', 'import quota', 'trade barrier', 'infant industry'],
        ['free trade', 'trade liberalisation', 'WTO', 'trade agreement'],
    ],
    Physics: [
        ["Newton's second law", 'F=ma', 'force mass acceleration', 'net force'],
        ["Coulomb's law", 'electric force', 'electrostatic force', 'inverse square law charge'],
        ["Faraday's law", 'electromagnetic induction', 'induced EMF', 'flux change'],
        ["Lenz's law", 'induced current direction', 'opposing flux'],
        ['simple harmonic motion', 'SHM', 'oscillation', 'periodic motion', 'restoring force'],
        ['photoelectric effect', 'photon energy', 'work function', 'threshold frequency', 'Einstein photoelectric'],
        ['de Broglie', 'wave-particle duality', 'matter waves', 'electron diffraction'],
        ['Bohr model', 'atomic model', 'electron orbit', 'energy levels hydrogen'],
        ['radioactive decay', 'half-life', 'decay constant', 'activity', 'nuclear stability'],
        ['nuclear fission', 'chain reaction', 'critical mass', 'uranium-235'],
        ['nuclear fusion', 'hydrogen fusion', 'stellar nucleosynthesis', 'binding energy per nucleon'],
        ['Doppler effect', 'redshift', 'blueshift', 'frequency shift', 'recession velocity'],
        ['gravitational field', 'gravitational field strength', 'g', 'free fall'],
        ['electric field', 'field strength', 'potential difference', 'voltage'],
    ],
    Mathematics: [
        ['integration by parts', 'IBP', 'uv rule', 'uv - integral v du'],
        ['chain rule', 'composite function differentiation', 'dy/dx = dy/du × du/dx'],
        ['product rule', 'uv differentiation', 'd(uv)/dx'],
        ['binomial theorem', 'binomial expansion', "Pascal's triangle", 'nCr expansion'],
        ['geometric series', 'geometric progression', 'GP', 'common ratio'],
        ['arithmetic series', 'arithmetic progression', 'AP', 'common difference'],
        ['normal distribution', 'Gaussian distribution', 'bell curve', 'z-score', 'standard deviation'],
        ['Poisson distribution', 'rare events distribution', 'λ events'],
        ["Bayes' theorem", 'bayes theorem', 'conditional probability', 'posterior probability'],
        ['eigenvalue', 'eigenvector', 'characteristic equation', 'diagonalisation'],
        ['implicit differentiation', 'dy/dx implicit', 'related rates'],
        ['vector cross product', 'cross product', 'perpendicular vector'],
    ],
};

// Build a flat bidirectional lookup: lowercase_term → Set<lowercase_synonym>
const _lookup = new Map();

for (const groups of Object.values(RAW_MAP)) {
    for (const group of groups) {
        const lowerGroup = group.map(t => t.toLowerCase());
        for (const term of lowerGroup) {
            if (!_lookup.has(term)) _lookup.set(term, new Set());
            for (const synonym of lowerGroup) {
                if (synonym !== term) _lookup.get(term).add(synonym);
            }
        }
    }
}

// Pre-compiled phrase matchers: term → RegExp with word boundaries.
// Handles multi-word terms (e.g. "sa node") and single tokens (e.g. "ped").
// Boundary: not preceded/followed by a-z or 0-9, so "ms" won't fire inside "terms".
const _matchers = new Map();
for (const term of _lookup.keys()) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    _matchers.set(term, new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i'));
}

function _termMatchesText(term, text) {
    const re = _matchers.get(term);
    return re ? re.test(text) : false;
}

/**
 * Given an array of keywords (already lowercased) and the original raw query,
 * return an expanded array including synonyms for any recognised IB terms.
 * - Exact match: single keyword matches a lookup key directly.
 * - Phrase match: the original query (or joined keywords) contains a multi-word
 *   lookup key (e.g. "post-transcriptional modification").
 * Used to widen the FULLTEXT keyword list before MySQL search.
 */
function expandKeywords(keywords, originalQuery = '') {
    const expanded = new Set(keywords);
    const searchText = originalQuery || keywords.join(' ');

    for (const [term, syns] of _lookup.entries()) {
        if (_termMatchesText(term, searchText)) {
            for (const s of syns) expanded.add(s);
        }
    }
    return Array.from(expanded);
}

/**
 * Augment a query string with synonym terms before embedding.
 * Appends variants that don't already appear in the query as a parenthetical,
 * shifting the embedding vector toward the broader topic neighbourhood.
 * Uses word-boundary matching to avoid false positives (e.g. "ms" in "terms").
 *
 * Example:
 *   "post-transcriptional modification of pre-mRNA"
 *   → "post-transcriptional modification of pre-mRNA (also: RNA processing, splicing, intron removal)"
 */
function augmentQueryForEmbedding(query) {
    const additions = new Set();

    for (const [term, syns] of _lookup.entries()) {
        if (_termMatchesText(term, query)) {
            for (const s of syns) {
                if (!_termMatchesText(s, query)) additions.add(s);
            }
        }
    }

    if (additions.size === 0) return query;
    return `${query} (also: ${Array.from(additions).slice(0, 8).join(', ')})`;
}

module.exports = { expandKeywords, augmentQueryForEmbedding };
