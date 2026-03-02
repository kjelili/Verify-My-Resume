/**
 * Job search API – populates from Google Jobs via SerpAPI.
 * Deploy to Vercel/Netlify and set env: SERPAPI_KEY (get one at serpapi.com).
 * Frontend: set window.VerifyIQ_JOB_API_URL = '/api/jobs' (or your deployed URL).
 * Other APIs (Indeed, LinkedIn, etc.) can be added later.
 */

const SERPAPI_BASE = 'https://serpapi.com/search.json';

function normalizeGoogleJob(item, index) {
  const company = item.company_name || 'Company';
  const location = (item.location || '').trim() || 'Location not specified';
  const locLower = location.toLowerCase();
  const locationType = (locLower.indexOf('remote') >= 0 || locLower === 'anywhere') ? 'remote' : '';
  const desc = (item.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const detected = item.detected_extensions || {};
  let type = 'full-time';
  const schedule = (detected.schedule_type || '').toLowerCase();
  if (schedule.indexOf('part') >= 0) type = 'part-time';
  else if (schedule.indexOf('contract') >= 0) type = 'contract';
  else if (schedule.indexOf('intern') >= 0) type = 'internship';
  const posted = detected.posted_at || (Array.isArray(item.extensions) && item.extensions[0]) || 'Recently';
  const applyOptions = item.apply_options || [];
  const applyUrl = (applyOptions[0] && applyOptions[0].link) || item.link || '';

  return {
    id: item.job_id || 'google-' + index,
    title: item.title || 'Job',
    company_name: company,
    company: { display_name: company },
    location: location,
    locationType: locationType,
    description: desc || item.title || 'No description.',
    redirect_url: applyUrl,
    url: applyUrl,
    via: item.via,
    posted_at: posted,
    schedule_type: detected.schedule_type,
    extensions: item.extensions
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      results: [],
      message: 'Set SERPAPI_KEY in environment to populate from Google Jobs. Get a key at serpapi.com.'
    });
  }

  // Build query exactly like a user typing in Google Search for jobs: "data scientist jobs" or "project manager jobs in Berlin"
  let q = (req.query && req.query.q) || '';
  q = String(q).trim() || 'jobs';
  const qLower = q.toLowerCase();
  if (qLower.indexOf(' jobs') === -1 && qLower !== 'jobs') {
    q = q + ' jobs';
  }
  let location = (req.query && req.query.location) || '';
  let country = (req.query && req.query.country) || '';

  // Map short location values to full names SerpAPI/Google Jobs understand
  const locationMap = {
    'london': 'London, UK',
    'new-york': 'New York, NY',
    'san-francisco': 'San Francisco, CA',
    'berlin': 'Berlin, Germany',
    'toronto': 'Toronto, Canada',
    'remote': ''
  };
  if (location && locationMap[location.toLowerCase()] !== undefined) {
    location = locationMap[location.toLowerCase()];
  }

  // gl (country code for SerpAPI) – must match search region. Accept any 2-letter ISO code for worldwide search.
  function getGlFromLocation(loc, explicitCountry) {
    const c = String(explicitCountry || '').toLowerCase().trim();
    if (c) {
      const codeMap = { gb: 'uk', uk: 'uk', us: 'us', de: 'de', ca: 'ca', au: 'au', fr: 'fr', in: 'in', nl: 'nl', ie: 'ie', sg: 'sg', jp: 'jp', es: 'es', it: 'it', br: 'br', mx: 'mx', za: 'za', nz: 'nz', pl: 'pl', se: 'se', ch: 'ch', be: 'be', at: 'at', pt: 'pt', hk: 'hk', ae: 'ae', il: 'il', ph: 'ph', id: 'id', my: 'my', ar: 'ar', cl: 'cl', co: 'co', no: 'no', dk: 'dk', fi: 'fi', ru: 'ru', kr: 'kr', cn: 'cn', th: 'th', vn: 'vn', tr: 'tr', eg: 'eg', ng: 'ng', ke: 'ke', gh: 'gh', ma: 'ma', tn: 'tn', dz: 'dz', et: 'et', tz: 'tz', ug: 'ug', cm: 'cm', ci: 'ci', sn: 'sn', zw: 'zw', zm: 'zm', bw: 'bw', ao: 'ao', mz: 'mz', rw: 'rw', mu: 'mu', na: 'na', ro: 'ro', cz: 'cz', hu: 'hu', gr: 'gr', hr: 'hr', rs: 'rs', bg: 'bg', ua: 'ua', sk: 'sk', si: 'si', lt: 'lt', lv: 'lv', ee: 'ee', is: 'is', lu: 'lu', mt: 'mt', cy: 'cy', pk: 'pk', bd: 'bd', lk: 'lk', np: 'np', kh: 'kh', mm: 'mm', kz: 'kz', sa: 'sa', qa: 'qa', kw: 'kw', bh: 'bh', om: 'om', jo: 'jo', lb: 'lb', pe: 'pe', ec: 'ec', ve: 've', cr: 'cr', pa: 'pa', uy: 'uy', bo: 'bo', py: 'py', do: 'do', jm: 'jm', fj: 'fj' };
      const gl = codeMap[c] || c;
      if (gl.length === 2) return gl;
    }
    const locLower = (loc || '').toLowerCase();
    if (locLower.indexOf('germany') >= 0) return 'de';
    if (locLower.indexOf('united kingdom') >= 0 || locLower.indexOf('uk') >= 0 || locLower.indexOf('london') >= 0) return 'uk';
    if (locLower.indexOf('canada') >= 0) return 'ca';
    if (locLower.indexOf('australia') >= 0) return 'au';
    if (locLower.indexOf('france') >= 0) return 'fr';
    if (locLower.indexOf('india') >= 0) return 'in';
    if (locLower.indexOf('netherlands') >= 0) return 'nl';
    if (locLower.indexOf('ireland') >= 0) return 'ie';
    if (locLower.indexOf('singapore') >= 0) return 'sg';
    if (locLower.indexOf('japan') >= 0) return 'jp';
    if (locLower.indexOf('spain') >= 0) return 'es';
    if (locLower.indexOf('italy') >= 0) return 'it';
    if (locLower.indexOf('brazil') >= 0) return 'br';
    if (locLower.indexOf('mexico') >= 0) return 'mx';
    if (locLower.indexOf('south africa') >= 0) return 'za';
    if (locLower.indexOf('new zealand') >= 0) return 'nz';
    if (locLower.indexOf('poland') >= 0) return 'pl';
    if (locLower.indexOf('sweden') >= 0) return 'se';
    if (locLower.indexOf('switzerland') >= 0) return 'ch';
    if (locLower.indexOf('belgium') >= 0) return 'be';
    if (locLower.indexOf('austria') >= 0) return 'at';
    if (locLower.indexOf('portugal') >= 0) return 'pt';
    if (locLower.indexOf('united states') >= 0 || locLower.indexOf('remote') >= 0) return 'us';
    return 'us';
  }
  const gl = getGlFromLocation(location, country);

  const glToCountry = { de: 'Germany', uk: 'United Kingdom', ca: 'Canada', us: 'United States', au: 'Australia', fr: 'France', in: 'India', nl: 'Netherlands', ie: 'Ireland', sg: 'Singapore', jp: 'Japan', es: 'Spain', it: 'Italy', br: 'Brazil', mx: 'Mexico', za: 'South Africa', nz: 'New Zealand', pl: 'Poland', se: 'Sweden', ch: 'Switzerland', be: 'Belgium', at: 'Austria', pt: 'Portugal', hk: 'Hong Kong', ae: 'United Arab Emirates', il: 'Israel', ph: 'Philippines', id: 'Indonesia', my: 'Malaysia', ar: 'Argentina', cl: 'Chile', co: 'Colombia', no: 'Norway', dk: 'Denmark', fi: 'Finland', ru: 'Russia', kr: 'South Korea', cn: 'China', th: 'Thailand', vn: 'Vietnam', tr: 'Turkey', eg: 'Egypt', ng: 'Nigeria', ke: 'Kenya', gh: 'Ghana', ma: 'Morocco', tn: 'Tunisia', dz: 'Algeria', et: 'Ethiopia', tz: 'Tanzania', ug: 'Uganda', cm: 'Cameroon', ci: 'Ivory Coast', sn: 'Senegal', zw: 'Zimbabwe', zm: 'Zambia', bw: 'Botswana', ao: 'Angola', mz: 'Mozambique', rw: 'Rwanda', mu: 'Mauritius', na: 'Namibia', ro: 'Romania', cz: 'Czech Republic', hu: 'Hungary', gr: 'Greece', hr: 'Croatia', rs: 'Serbia', bg: 'Bulgaria', ua: 'Ukraine', sk: 'Slovakia', si: 'Slovenia', lt: 'Lithuania', lv: 'Latvia', ee: 'Estonia', is: 'Iceland', lu: 'Luxembourg', mt: 'Malta', cy: 'Cyprus', pk: 'Pakistan', bd: 'Bangladesh', lk: 'Sri Lanka', np: 'Nepal', kh: 'Cambodia', mm: 'Myanmar', kz: 'Kazakhstan', sa: 'Saudi Arabia', qa: 'Qatar', kw: 'Kuwait', bh: 'Bahrain', om: 'Oman', jo: 'Jordan', lb: 'Lebanon', pe: 'Peru', ec: 'Ecuador', ve: 'Venezuela', cr: 'Costa Rica', pa: 'Panama', uy: 'Uruguay', bo: 'Bolivia', py: 'Paraguay', do: 'Dominican Republic', jm: 'Jamaica', fj: 'Fiji' };
  let locationForApi = (location || '').trim();
  const isRemote = locationForApi.toLowerCase() === 'remote';
  if (isRemote) {
    locationForApi = glToCountry[gl] || 'United States';
  } else if (!locationForApi || locationForApi.toLowerCase() === 'anywhere') {
    locationForApi = glToCountry[gl] || 'United States';
  }

  // Query: for remote add "remote" so we get remote listings; else "keyword jobs in [country]" so any job type returns results
  const qWithLocation = isRemote ? (q + ' remote jobs') : (locationForApi ? (q + ' in ' + locationForApi) : q);

  // Language: match locale to country for better live results in non-English regions
  const hlMap = { de: 'de', fr: 'fr', es: 'es', it: 'it', pt: 'pt', br: 'pt', jp: 'ja', cn: 'zh-cn', kr: 'ko', nl: 'nl', pl: 'pl', ru: 'ru', tr: 'tr', ar: 'ar', in: 'en', sg: 'en', hk: 'zh-tw', th: 'th', vn: 'vi', id: 'id', my: 'ms' };
  const hl = hlMap[gl] || 'en';

  function parseResults(data) {
    if (!data || data.error) return null;
    let raw = [];
    if (data.jobs_results !== undefined) {
      if (Array.isArray(data.jobs_results)) raw = data.jobs_results;
      else if (data.jobs_results && data.jobs_results.jobs && Array.isArray(data.jobs_results.jobs)) raw = data.jobs_results.jobs;
    }
    return raw.map((r, i) => normalizeGoogleJob(r, i));
  }

  async function doFetch(locParam, queryStr) {
    const p = new URLSearchParams({ engine: 'google_jobs', q: queryStr || qWithLocation, api_key: apiKey, gl: gl, hl: hl });
    p.set('location', locParam);
    const res = await fetch(SERPAPI_BASE + '?' + p.toString());
    const data = await res.json().catch(() => ({}));
    if (data && data.error) return { error: data.error, results: [] };
    if (!res.ok) return { error: 'SerpAPI request failed', results: [] };
    const status = data && data.search_metadata && data.search_metadata.status;
    if (status === 'Processing') return { results: [], message: 'Search still processing.' };
    return { results: parseResults(data), data };
  }

  try {
    let out = await doFetch(locationForApi, qWithLocation);

    // Fallback: if 0 results, retry with country-level location (works for "Use my location" and city dropdowns)
    const broadLocations = { 'Berlin, Germany': 'Germany', 'London, UK': 'United Kingdom', 'Toronto, Canada': 'Canada', 'New York, NY': 'United States', 'San Francisco, CA': 'United States' };
    if (out.results && out.results.length === 0 && broadLocations[locationForApi]) {
      const fallbackLoc = broadLocations[locationForApi];
      const fallbackQuery = q + ' in ' + fallbackLoc;
      const fallback = await doFetch(fallbackLoc, fallbackQuery);
      if (fallback.results && fallback.results.length > 0) out = fallback;
    }
    // Fallback: retry with country-only or with simpler query so any job type can populate
    if (out.results && out.results.length === 0 && locationForApi && locationForApi.indexOf(',') >= 0) {
      const countryPart = locationForApi.split(',').pop().trim().toLowerCase();
      const countryToLocation = { 'uk': 'United Kingdom', 'us': 'United States', 'united kingdom': 'United Kingdom', 'united states': 'United States', 'germany': 'Germany', 'canada': 'Canada', 'australia': 'Australia', 'france': 'France', 'india': 'India', 'netherlands': 'Netherlands' };
      const fallbackLoc = countryToLocation[countryPart] || locationForApi;
      if (fallbackLoc !== locationForApi) {
        const fallbackQuery = q + ' in ' + fallbackLoc;
        const fallback = await doFetch(fallbackLoc, fallbackQuery);
        if (fallback.results && fallback.results.length > 0) out = fallback;
      }
    }
    if (out.results && out.results.length === 0 && locationForApi) {
      const broadQuery = 'jobs in ' + locationForApi;
      const fallback = await doFetch(locationForApi, broadQuery);
      if (fallback.results && fallback.results.length > 0) out = fallback;
    }
    // Final fallback: keyword-only query (no " in Location") — often returns live jobs when location-specific returns 0
    if (out.results && out.results.length === 0) {
      const keywordOnlyQuery = q;
      const fallback = await doFetch(locationForApi || 'United States', keywordOnlyQuery);
      if (fallback.results && fallback.results.length > 0) out = fallback;
    }

    const results = out.results || [];
    if (results.length === 0 && out.data && typeof console !== 'undefined' && console.log) {
      console.log('[jobs API] 0 results. SerpAPI keys:', Object.keys(out.data || {}).join(', '));
    }

    return res.status(200).json({
      results,
      ...(out.error && { error: out.error, message: out.error }),
      ...(results.length === 0 && !out.error && { message: 'No jobs found for this search. Try different keywords or location.' })
    });
  } catch (e) {
    return res.status(200).json({ results: [], error: String(e.message) });
  }
};
