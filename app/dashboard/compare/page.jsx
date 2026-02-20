'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GitCompare, 
  Trash2, 
  Zap, 
  Loader, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  ArrowRight,
  RefreshCw,
  Building2,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Globe
} from 'lucide-react';
import { mockCompanies } from '@/lib/mockData';
import { storage } from '@/lib/storage';

export default function ComparePage() {
  const [compareLists, setCompareLists] = useState([]);
  const [allLists, setAllLists] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, company: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const lists = storage.getLists();
    const compareListIds = storage.getCompareLists();
    setAllLists(lists);
    setCompareLists(lists.filter(l => compareListIds.includes(l.id)));
  };

  const removeFromCompare = (listId) => {
    storage.removeFromCompare(listId);
    loadData();
  };

  const clearAllCompare = () => {
    storage.clearCompare();
    setCompareLists([]);
    setComparisonResults(null);
  };

  // Get all unique companies from all compare lists
  const getAllCompanies = () => {
    const companyIds = new Set();
    compareLists.forEach(list => {
      list.companies.forEach(id => companyIds.add(id));
    });
    return mockCompanies.filter(c => companyIds.has(c.id));
  };

  // Run comparison - enrich all companies and compare
  const runComparison = async () => {
    const companies = getAllCompanies();
    if (companies.length === 0) {
      setError('No companies to compare. Add companies to your lists first.');
      return;
    }

    setIsComparing(true);
    setError(null);
    setProgress({ current: 0, total: companies.length, company: '' });

    const results = [];

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      setProgress({ current: i + 1, total: companies.length, company: company.name });

      // Check if we have cached enrichment data
      let enrichmentData = storage.getEnrichmentCache(company.id);

      if (!enrichmentData) {
        // Run enrichment
        try {
          const response = await fetch('/api/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyId: company.id,
              website: company.website,
              name: company.name,
              description: company.description,
              industry: company.industry,
              founded: company.founded,
              employees: company.employees,
            }),
          });

          const result = await response.json();
          if (result.success) {
            enrichmentData = result.data;
            storage.setEnrichmentCache(company.id, enrichmentData);
          }
        } catch (err) {
          console.error(`Failed to enrich ${company.name}:`, err);
        }
      }

      results.push({
        company,
        enrichment: enrichmentData,
      });
    }

    setComparisonResults(results);
    setIsComparing(false);
  };

  // Get signal status for display
  const getSignalStatus = (signals, label) => {
    if (!signals) return null;
    const signal = signals.find(s => s.label === label);
    return signal?.detected;
  };

  // Get best value highlight
  const getBestScore = () => {
    if (!comparisonResults) return null;
    const scores = comparisonResults.map(r => r.enrichment?.score || 0);
    return Math.max(...scores);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <GitCompare className="text-emerald-400" />
            Compare Companies
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare companies across your lists with AI-powered analysis
          </p>
        </div>
        {compareLists.length > 0 && (
          <button
            onClick={clearAllCompare}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
            Clear All
          </button>
        )}
      </div>

      {/* Compare Lists */}
      {compareLists.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <GitCompare size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No lists added for comparison</p>
          <p className="text-sm text-muted-foreground mb-4">
            Go to Lists and click the compare icon to add lists for comparison
          </p>
          <Link
            href="/dashboard/lists"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            Go to Lists
            <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <>
          {/* Selected Lists */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Lists to Compare ({compareLists.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {compareLists.map(list => (
                <div
                  key={list.id}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
                >
                  <span className="text-sm font-medium text-foreground">{list.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({list.companies.length} companies)
                  </span>
                  <button
                    onClick={() => removeFromCompare(list.id)}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <XCircle size={14} className="text-muted-foreground hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Compare Button */}
          <div className="flex justify-center">
            <button
              onClick={runComparison}
              disabled={isComparing || getAllCompanies().length === 0}
              className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
            >
              {isComparing ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Analyzing {progress.company}... ({progress.current}/{progress.total})
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Compare Now ({getAllCompanies().length} Companies)
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Comparison Results */}
          {comparisonResults && comparisonResults.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Comparison Results</h2>
                <button
                  onClick={runComparison}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <RefreshCw size={16} />
                  Re-analyze
                </button>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    {/* Header Row - Company Names */}
                    <div className="grid border-b border-border" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                      <div className="p-4 bg-secondary/50 font-semibold text-muted-foreground">
                        Metrics
                      </div>
                      {comparisonResults.map((result, idx) => (
                        <div key={idx} className="p-4 bg-secondary/50 text-center border-l border-border">
                          <Link 
                            href={`/dashboard/companies/${result.company.id}`}
                            className="text-lg font-bold text-primary hover:underline"
                          >
                            {result.company.name}
                          </Link>
                        </div>
                      ))}
                    </div>

                    {/* Basic Info Section */}
                    <div className="border-b border-border">
                      <div className="grid" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                        <div className="p-3 bg-emerald-500/5 text-xs font-semibold text-emerald-400 uppercase tracking-wider col-span-full">
                          Basic Information
                        </div>
                      </div>
                      
                      {/* Industry */}
                      <div className="grid border-t border-border/50" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                        <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 size={16} /> Industry
                        </div>
                        {comparisonResults.map((result, idx) => (
                          <div key={idx} className="p-3 text-center text-sm text-foreground border-l border-border/50">
                            {result.company.industry}
                          </div>
                        ))}
                      </div>

                      {/* Location */}
                      <div className="grid border-t border-border/50" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                        <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin size={16} /> Location
                        </div>
                        {comparisonResults.map((result, idx) => (
                          <div key={idx} className="p-3 text-center text-sm text-foreground border-l border-border/50">
                            {result.company.location}
                          </div>
                        ))}
                      </div>

                      {/* Employees */}
                      <div className="grid border-t border-border/50" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                        <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <Users size={16} /> Employees
                        </div>
                        {comparisonResults.map((result, idx) => (
                          <div key={idx} className="p-3 text-center text-sm text-foreground border-l border-border/50">
                            {result.company.employees?.toLocaleString() || 'N/A'}
                          </div>
                        ))}
                      </div>

                      {/* Founded */}
                      <div className="grid border-t border-border/50" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                        <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar size={16} /> Founded
                        </div>
                        {comparisonResults.map((result, idx) => (
                          <div key={idx} className="p-3 text-center text-sm text-foreground border-l border-border/50">
                            {result.company.founded || 'N/A'}
                          </div>
                        ))}
                      </div>

                      {/* Website */}
                      <div className="grid border-t border-border/50" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                        <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe size={16} /> Website
                        </div>
                        {comparisonResults.map((result, idx) => (
                          <div key={idx} className="p-3 text-center text-sm border-l border-border/50">
                            <a 
                              href={result.company.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate block"
                            >
                              {result.company.website?.replace('https://', '')}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="border-b border-border">
                      <div className="grid" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                        <div className="p-3 bg-emerald-500/5 text-xs font-semibold text-emerald-400 uppercase tracking-wider col-span-full">
                          AI Investment Analysis
                        </div>
                      </div>

                      {/* Score */}
                      <div className="grid border-t border-border/50" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                        <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp size={16} /> Score
                        </div>
                        {comparisonResults.map((result, idx) => {
                          const score = result.enrichment?.score;
                          const bestScore = getBestScore();
                          const isBest = score === bestScore && score > 0;
                          return (
                            <div key={idx} className={`p-3 text-center border-l border-border/50 ${isBest ? 'bg-emerald-500/10' : ''}`}>
                              <span className={`text-2xl font-bold ${
                                score >= 70 ? 'text-emerald-400' :
                                score >= 50 ? 'text-amber-400' : 'text-red-400'
                              }`}>
                                {score || 'N/A'}
                              </span>
                              {isBest && <span className="ml-2 text-xs text-emerald-400">★ Best</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Grade */}
                      <div className="grid border-t border-border/50" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                        <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                          Grade
                        </div>
                        {comparisonResults.map((result, idx) => {
                          const grade = result.enrichment?.grade;
                          return (
                            <div key={idx} className="p-3 text-center border-l border-border/50">
                              <span className={`inline-block px-3 py-1 text-lg font-bold rounded ${
                                grade === 'A' ? 'bg-emerald-900/30 text-emerald-400' :
                                grade === 'B' ? 'bg-teal-900/30 text-teal-400' :
                                grade === 'C' ? 'bg-amber-900/30 text-amber-400' :
                                'bg-red-900/30 text-red-400'
                              }`}>
                                {grade || 'N/A'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Recommendation */}
                      <div className="grid border-t border-border/50" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                        <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                          Recommendation
                        </div>
                        {comparisonResults.map((result, idx) => {
                          const rec = result.enrichment?.recommendation;
                          return (
                            <div key={idx} className="p-3 text-center border-l border-border/50">
                              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                                rec?.includes('Strong Buy') ? 'bg-emerald-600 text-white' :
                                rec?.includes('Buy') ? 'bg-emerald-900/30 text-emerald-400' :
                                rec?.includes('Hold') ? 'bg-amber-900/30 text-amber-400' :
                                'bg-red-900/30 text-red-400'
                              }`}>
                                {rec || 'N/A'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Funding Stage */}
                      <div className="grid border-t border-border/50" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                        <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                          Funding Stage
                        </div>
                        {comparisonResults.map((result, idx) => (
                          <div key={idx} className="p-3 text-center text-sm text-foreground border-l border-border/50">
                            {result.enrichment?.fundingStage || 'Unknown'}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Signals Section */}
                    <div>
                      <div className="grid" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                        <div className="p-3 bg-emerald-500/5 text-xs font-semibold text-emerald-400 uppercase tracking-wider col-span-full">
                          Investment Signals
                        </div>
                      </div>

                      {['Hiring actively', 'Enterprise customers', 'Market expansion', 'Revenue growth', 'Strong technical team'].map((signalLabel) => (
                        <div key={signalLabel} className="grid border-t border-border/50" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                          <div className="p-3 text-sm text-muted-foreground">
                            {signalLabel}
                          </div>
                          {comparisonResults.map((result, idx) => {
                            const detected = getSignalStatus(result.enrichment?.signals, signalLabel);
                            return (
                              <div key={idx} className="p-3 text-center border-l border-border/50">
                                {detected === true ? (
                                  <CheckCircle2 className="inline text-emerald-400" size={20} />
                                ) : detected === false ? (
                                  <XCircle className="inline text-gray-500" size={20} />
                                ) : (
                                  <span className="text-gray-500">—</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Summary Row */}
                    <div className="grid border-t border-border" style={{ gridTemplateColumns: `200px repeat(${comparisonResults.length}, minmax(200px, 1fr))` }}>
                      <div className="p-4 bg-secondary/30 font-semibold text-muted-foreground">
                        Summary
                      </div>
                      {comparisonResults.map((result, idx) => (
                        <div key={idx} className="p-4 bg-secondary/30 text-sm text-muted-foreground border-l border-border">
                          {result.enrichment?.summary?.slice(0, 150)}...
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Thesis Comparison */}
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${comparisonResults.length}, 1fr)` }}>
                {comparisonResults.map((result, idx) => (
                  <div key={idx} className="bg-card rounded-lg border border-border p-4">
                    <h3 className="font-semibold text-foreground mb-2">{result.company.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.enrichment?.thesis || 'No investment thesis available.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
