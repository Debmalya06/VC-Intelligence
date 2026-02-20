// Groq AI Enrichment Pipeline
// Implements: AI Scrape → LLM Extractor → Signal Engine → Scoring
// Based on MVP: UI + AI Scrape + show extracted fields + sources

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Helper: Sleep for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper: Call Groq API with retry logic
 */
async function callGroqWithRetry(prompt, maxRetries = 3) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', // Fast and free model
          messages: [
            { 
              role: 'system', 
              content: 'You are a VC analyst. Always respond with valid JSON only, no markdown formatting.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.4,
          max_tokens: 2048,
        }),
      });

      if (response.status === 429) {
        // Rate limited
        console.log(`[Groq] Rate limited. Waiting 10s before retry ${attempt}/${maxRetries}`);
        lastError = new Error('Rate limited after all retries');
        await sleep(10000);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Groq] API error ${response.status}:`, errorText.slice(0, 200));
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error('Empty response from Groq');
      }

      // Parse JSON from response
      let jsonStr = text;
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1] || jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);
      
      // Debug: Log what we got from Groq
      console.log('[Groq] Received data keys:', Object.keys(parsed));
      console.log('[Groq] Score:', parsed.score, '| Grade:', parsed.grade, '| Funding:', parsed.fundingStage);
      
      return parsed;
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`[Groq] Attempt ${attempt} failed, retrying...`);
      await sleep(2000 * attempt); // Exponential backoff
    }
  }
  
  // If we exit the loop without returning, all retries were rate limited
  console.error('[Groq] All retries exhausted');
  throw lastError || new Error('Groq API failed after all retries');
}

/**
 * STEP 1: AI Scrape - fetch + render + text
 * Fetches website content and extracts readable text
 */
async function aiScrape(url) {
  console.log('[AI Scrape] Fetching:', url);
  
  if (!url) {
    return { success: false, content: null, sources: [], error: 'No URL provided' };
  }

  try {
    // Try multiple pages for better coverage
    const baseUrl = url.replace(/\/$/, '');
    const pagesToTry = [
      baseUrl,
      baseUrl + '/about',
      baseUrl + '/about-us',
      baseUrl + '/company',
    ];

    let allContent = '';
    let successfulPages = [];

    for (const pageUrl of pagesToTry) {
      try {
        const response = await fetch(pageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          },
          signal: AbortSignal.timeout(10000),
          redirect: 'follow',
        });

        if (response.ok) {
          const html = await response.text();
          
          // Extract text content - remove scripts, styles, and HTML tags
          const text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
            .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
            .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();

          if (text.length > 200) {
            allContent += `\n\n=== ${pageUrl} ===\n${text.slice(0, 4000)}`;
            successfulPages.push(pageUrl);
            console.log(`[AI Scrape] Got ${text.length} chars from ${pageUrl}`);
          }
        }
      } catch (e) {
        // Continue to next page
      }
    }

    if (allContent.length > 0) {
      console.log(`[AI Scrape] Total: ${allContent.length} chars from ${successfulPages.length} pages`);
      return {
        success: true,
        content: allContent.slice(0, 10000),
        sources: successfulPages,
        scrapedAt: new Date().toISOString(),
      };
    }

    return { success: false, content: null, sources: [], error: 'No content extracted' };
  } catch (error) {
    console.error('[AI Scrape] Error:', error.message);
    return { success: false, content: null, sources: [], error: error.message };
  }
}

/**
 * STEP 2-4: Combined LLM Processing
 * Uses single Gemini call to extract all information (more efficient for rate limits)
 */
async function llmProcess(company, scrapedContent) {
  console.log('[LLM Process] Starting comprehensive analysis');

  const prompt = `You are a VC analyst. Analyze this company comprehensively for investment evaluation.

=== COMPANY INFO ===
Name: ${company.name}
Website: ${company.website || 'N/A'}
Industry: ${company.industry || 'Unknown'}
Description: ${company.description || 'N/A'}
Founded: ${company.founded || 'Unknown'}
Employees: ${company.employees || 'Unknown'}

=== SCRAPED WEBSITE CONTENT ===
${scrapedContent || 'No website content available - analyze based on provided info only.'}

=== TASK ===
Extract structured data and provide investment analysis. Return a JSON object with ALL these fields:

{
  "summary": "2-3 sentence executive summary",
  "whatTheyDo": ["5 specific points about their products/services"],
  "businessModel": "How they make money",
  "targetCustomers": "Who their customers are",
  "keyProducts": ["Main products/services list"],
  "techStack": ["Technologies they likely use"],
  "fundingStage": "Seed/Series A/B/C/Growth/Public/Unknown",
  "competitors": ["3-5 direct competitors"],
  "marketPosition": "Their market position description",
  
  "signals": [
    {"label": "Hiring actively", "detected": true/false, "evidence": "brief reason"},
    {"label": "Recent product launch", "detected": true/false, "evidence": "brief reason"},
    {"label": "Enterprise customers", "detected": true/false, "evidence": "brief reason"},
    {"label": "Strong technical team", "detected": true/false, "evidence": "brief reason"},
    {"label": "Market expansion", "detected": true/false, "evidence": "brief reason"},
    {"label": "Revenue growth", "detected": true/false, "evidence": "brief reason"},
    {"label": "Partnership activity", "detected": true/false, "evidence": "brief reason"}
  ],
  "signalStrength": "Strong/Moderate/Weak",
  "keyInsight": "One key insight for investors",
  
  "score": 0-100,
  "grade": "A/B/C/D/F",
  "recommendation": "Strong Buy/Buy/Hold/Pass",
  "thesis": "2-3 sentences on investment thesis",
  "strengths": ["3 key strengths"],
  "risks": ["3 key risks"],
  "nextSteps": ["2-3 due diligence steps"]
}

Return ONLY valid JSON, no markdown formatting or extra text.`;

  try {
    const result = await callGroqWithRetry(prompt);
    console.log('[LLM Process] Analysis complete');
    console.log('[LLM Process] Result has score:', result?.score, '| grade:', result?.grade);
    return { success: true, data: result };
  } catch (error) {
    console.error('[LLM Process] Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * MAIN: Full Enrichment Pipeline
 * Runs: AI Scrape → LLM Processing (Extract + Signals + Scoring)
 */
export async function performFullEnrichment(company) {
  console.log('\n========================================');
  console.log(`[Pipeline] Starting enrichment for: ${company.name}`);
  console.log('========================================\n');

  const pipeline = {
    company: company.name,
    website: company.website,
    startedAt: new Date().toISOString(),
  };

  // STEP 1: AI Scrape
  const scrapeResult = await aiScrape(company.website);
  
  // STEP 2-4: LLM Processing (combined for efficiency)
  let enrichmentData = null;
  let usedFallback = false;
  
  if (GROQ_API_KEY) {
    const llmResult = await llmProcess(company, scrapeResult.content);
    console.log('[Pipeline] LLM Result success:', llmResult.success);
    console.log('[Pipeline] LLM Result data:', llmResult.data ? 'present' : 'missing');
    if (llmResult.success && llmResult.data) {
      enrichmentData = llmResult.data;
      console.log('[Pipeline] Enrichment data score:', enrichmentData.score);
      console.log('[Pipeline] Enrichment data grade:', enrichmentData.grade);
      console.log('[Pipeline] Enrichment data funding:', enrichmentData.fundingStage);
    } else {
      console.log('[Pipeline] LLM failed, using fallback data');
      usedFallback = true;
    }
  } else {
    console.log('[Pipeline] No API key - using fallback data');
    usedFallback = true;
  }

  // Build final result - always returns data (real or fallback)
  const result = {
    // Metadata
    enrichedAt: new Date().toISOString(),
    source: usedFallback ? 'fallback-data' : 'groq-ai-pipeline',
    websiteScraped: scrapeResult.success,
    sources: scrapeResult.sources || [],

    // Extracted Data (from LLM or fallback)
    summary: enrichmentData?.summary || generateFallbackSummary(company),
    whatTheyDo: enrichmentData?.whatTheyDo || generateFallbackWhatTheyDo(company),
    businessModel: enrichmentData?.businessModel || 'SaaS / Technology',
    targetCustomers: enrichmentData?.targetCustomers || 'Businesses and enterprises',
    keyProducts: enrichmentData?.keyProducts || [company.name + ' Platform'],
    techStack: enrichmentData?.techStack || ['Cloud', 'Modern Web Stack'],
    fundingStage: enrichmentData?.fundingStage || 'Unknown',
    competitors: enrichmentData?.competitors || ['Various competitors'],
    marketPosition: enrichmentData?.marketPosition || 'Emerging player',

    // Signals
    signals: enrichmentData?.signals || generateFallbackSignals(),
    signalStrength: enrichmentData?.signalStrength || 'Unknown',
    keyInsight: enrichmentData?.keyInsight || 'Further analysis needed.',

    // Scoring
    score: enrichmentData?.score || (usedFallback ? 65 : null),
    grade: enrichmentData?.grade || (usedFallback ? 'B' : null),
    recommendation: enrichmentData?.recommendation || (usedFallback ? 'Hold - Needs Further Analysis' : null),
    thesis: enrichmentData?.thesis || (usedFallback ? `${company.name} operates in the ${company.industry || 'technology'} space. Manual review recommended to validate investment potential.` : ''),
    strengths: enrichmentData?.strengths || (usedFallback ? ['Established web presence', 'Clear product focus', 'Active in growing market'] : []),
    risks: enrichmentData?.risks || (usedFallback ? ['Limited data available', 'Competitive market', 'Further due diligence needed'] : []),
    nextSteps: enrichmentData?.nextSteps || (usedFallback ? ['Schedule founder call', 'Review financials', 'Analyze competitive landscape'] : []),
  };

  console.log('\n========================================');
  console.log(`[Pipeline] Completed: ${company.name}`);
  console.log(`[Pipeline] Final result.score: ${result.score}`);
  console.log(`[Pipeline] Final result.grade: ${result.grade}`);
  console.log(`[Pipeline] Final result.fundingStage: ${result.fundingStage}`);
  console.log(`[Pipeline] Final result.source: ${result.source}`);
  if (usedFallback) {
    console.log(`[Pipeline] Used fallback data (API unavailable)`);
  } else if (result.score) {
    console.log(`[Pipeline] Score: ${result.score} | Grade: ${result.grade} | ${result.recommendation}`);
  }
  console.log('========================================\n');

  return result;
}

// Fallback generators when API is unavailable
function generateFallbackSummary(company) {
  return `${company.name} is a ${company.industry || 'technology'} company based in ${company.location || 'the US'}. ${company.description || 'They provide innovative solutions in their market.'} Founded in ${company.founded || 'recent years'}, they have grown to ${company.employees || 'a dedicated'} team.`;
}

function generateFallbackWhatTheyDo(company) {
  return [
    `Provides ${company.industry || 'technology'} solutions`,
    company.description ? company.description.split('.')[0] : 'Offers innovative platform services',
    'Serves enterprise and SMB customers',
    'Focuses on user experience and scalability',
    `Operates from ${company.location || 'multiple locations'}`
  ];
}

function generateFallbackSignals() {
  return [
    { label: 'Hiring actively', detected: false, evidence: 'Check careers page for verification' },
    { label: 'Recent product launch', detected: false, evidence: 'Review blog/news for updates' },
    { label: 'Enterprise customers', detected: false, evidence: 'Check case studies section' },
    { label: 'Strong technical team', detected: false, evidence: 'Review LinkedIn profiles' },
    { label: 'Market expansion', detected: false, evidence: 'Check press releases' },
    { label: 'Revenue growth', detected: false, evidence: 'Review funding announcements' },
    { label: 'Partnership activity', detected: false, evidence: 'Check integrations page' },
  ];
}

// Export for testing
export { aiScrape, llmProcess };
