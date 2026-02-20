'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { mockCompanies } from '@/lib/mockData';
import { storage } from '@/lib/storage';
import { ArrowLeft, Download, Zap, CheckCircle2, AlertCircle, ExternalLink, Loader, RefreshCw, X, Plus, List, Check } from 'lucide-react';

export default function CompanyProfilePage() {
  const params = useParams();
  const company = mockCompanies.find((c) => c.id === parseInt(params.id));
  const [isSaved, setIsSaved] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState(null);
  const [enrichmentError, setEnrichmentError] = useState(null);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  
  // List management state
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [lists, setLists] = useState([]);
  const [companyLists, setCompanyLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const dropdownRef = useRef(null);

  // Load saved state and cached enrichment from localStorage
  useEffect(() => {
    if (company) {
      const savedNotes = storage.getNotes(company.id);
      setNotes(savedNotes);
      
      // Load cached enrichment if exists
      const cachedEnrichment = storage.getEnrichmentCache(company.id);
      if (cachedEnrichment) {
        setEnrichmentData(cachedEnrichment);
      }
      
      // Check if company is saved
      const savedCompanies = storage.getSavedCompanies();
      setIsSaved(savedCompanies.includes(company.id));
      
      // Load lists
      setLists(storage.getLists());
      setCompanyLists(storage.getCompanyLists(company.id));
    }
  }, [company?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowListDropdown(false);
        setIsCreatingList(false);
        setNewListName('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!company) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Company not found</p>
      </div>
    );
  }

  const handleEnrich = async (clearCache = false) => {
    // Clear old cache if requested
    if (clearCache) {
      localStorage.removeItem(`enrichment-${company.id}`);
      setEnrichmentData(null);
    }
    
    setIsEnriching(true);
    setEnrichmentError(null);
    
    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      if (!result.success) {
        throw new Error(result.error || 'Enrichment failed');
      }

      // Save to localStorage cache
      storage.setEnrichmentCache(company.id, result.data);
      setEnrichmentData(result.data);
    } catch (error) {
      console.error('Enrichment error:', error);
      setEnrichmentError(error.message);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(`enrichment-${company.id}`);
    setEnrichmentData(null);
    setEnrichmentError(null);
  };

  // List management functions
  const handleCreateList = () => {
    if (newListName.trim()) {
      const newList = storage.createList(newListName.trim());
      storage.addToList(newList.id, company.id);
      setLists(storage.getLists());
      setCompanyLists(storage.getCompanyLists(company.id));
      setNewListName('');
      setIsCreatingList(false);
    }
  };

  const handleToggleList = (listId) => {
    const isInList = companyLists.some(l => l.id === listId);
    if (isInList) {
      storage.removeFromList(listId, company.id);
    } else {
      storage.addToList(listId, company.id);
    }
    setLists(storage.getLists());
    setCompanyLists(storage.getCompanyLists(company.id));
  };

  const handleToggleSave = () => {
    const updated = storage.toggleSavedCompany(company.id);
    setIsSaved(updated.includes(company.id));
  };

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    storage.setNotes(company.id, notes);
  };

  const handleExport = (format) => {
    const data = {
      company: company.name,
      description: company.description,
      industry: company.industry,
      location: company.location,
      website: company.website,
      founded: company.founded,
      employees: company.employees,
      enrichment: enrichmentData,
      notes: notes,
      exportedAt: new Date().toISOString(),
    };

    let content;
    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
    } else {
      // TXT format with full enrichment details
      const lines = [
        `=== ${company.name} ===`,
        ``,
        `--- Basic Info ---`,
        `Industry: ${company.industry}`,
        `Location: ${company.location}`,
        `Website: ${company.website}`,
        `Founded: ${company.founded}`,
        `Employees: ${company.employees}`,
        ``,
        `--- Description ---`,
        company.description,
        ``,
      ];

      if (enrichmentData) {
        lines.push(`--- AI Enrichment ---`);
        lines.push(`Summary: ${enrichmentData.summary || 'N/A'}`);
        lines.push(``);
        lines.push(`What They Do: ${enrichmentData.whatTheyDo || 'N/A'}`);
        lines.push(``);
        if (enrichmentData.keywords?.length) {
          lines.push(`Keywords: ${enrichmentData.keywords.join(', ')}`);
        }
        if (enrichmentData.signals?.length) {
          lines.push(`Signals: ${enrichmentData.signals.join(', ')}`);
        }
        if (enrichmentData.competitors?.length) {
          lines.push(`Competitors: ${enrichmentData.competitors.join(', ')}`);
        }
        if (enrichmentData.techStack?.length) {
          lines.push(`Tech Stack: ${enrichmentData.techStack.join(', ')}`);
        }
        if (enrichmentData.fundingStage) {
          lines.push(`Funding Stage: ${enrichmentData.fundingStage}`);
        }
        if (enrichmentData.targetMarket) {
          lines.push(`Target Market: ${enrichmentData.targetMarket}`);
        }
        lines.push(``);
        lines.push(`Enriched At: ${enrichmentData.enrichedAt || 'N/A'}`);
      } else {
        lines.push(`--- AI Enrichment ---`);
        lines.push(`Not enriched yet`);
      }

      lines.push(``);
      lines.push(`--- Notes ---`);
      lines.push(notes || 'No notes');
      lines.push(``);
      lines.push(`Exported: ${new Date().toLocaleString()}`);
      
      content = lines.join('\n');
    }

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', `${company.name.replace(/\s+/g, '-').toLowerCase()}.${format}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/companies"
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {company.website} <ExternalLink size={14} />
              </a>
            </div>
          </div>
          <div className="flex gap-3 mt-3">
            <span className="px-3 py-1 bg-secondary text-foreground text-sm rounded-full">
              {company.industry}
            </span>
            <span className="px-3 py-1 bg-secondary text-foreground text-sm rounded-full">
              {company.location}
            </span>
            <span className="px-3 py-1 bg-secondary text-foreground text-sm rounded-full">
              {company.employees} employees
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {/* List Button with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowListDropdown(!showListDropdown)}
              className={`p-3 rounded-lg transition-colors ${
                companyLists.length > 0
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-muted'
              }`}
              title={companyLists.length > 0 ? `In ${companyLists.length} list(s)` : 'Add to list'}
            >
              <List size={20} />
            </button>
            
            {/* Dropdown */}
            {showListDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="p-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground px-2 py-1">Add to List</p>
                </div>
                
                <div className="max-h-48 overflow-y-auto">
                  {lists.length === 0 && !isCreatingList && (
                    <p className="text-sm text-muted-foreground px-4 py-3">No lists yet. Create one!</p>
                  )}
                  
                  {lists.map((list) => {
                    const isInList = companyLists.some(l => l.id === list.id);
                    return (
                      <button
                        key={list.id}
                        onClick={() => handleToggleList(list.id)}
                        className="w-full px-4 py-2 text-left hover:bg-secondary flex items-center justify-between gap-2 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <List size={16} className="text-muted-foreground" />
                          <span className="text-sm text-foreground">{list.name}</span>
                        </div>
                        {isInList && <Check size={16} className="text-primary" />}
                      </button>
                    );
                  })}
                </div>
                
                {/* Create new list */}
                <div className="border-t border-border p-2">
                  {isCreatingList ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                        placeholder="List name..."
                        className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                      <button
                        onClick={handleCreateList}
                        className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm hover:opacity-90"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsCreatingList(true)}
                      className="w-full px-2 py-2 text-left text-sm text-primary hover:bg-secondary rounded flex items-center gap-2 transition-colors"
                    >
                      <Plus size={16} />
                      Create new list
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Overview */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Overview</h2>
            <p className="text-foreground mb-4">{company.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Founded</p>
                <p className="font-semibold text-foreground">{company.founded}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  Visit
                </a>
              </div>
            </div>
          </div>

          {/* Enrichment Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Zap size={20} className="text-primary" />
                AI Enrichment
              </h2>
              <div className="flex gap-2">
                {enrichmentData && (
                  <>
                    <button
                      onClick={handleClear}
                      disabled={isEnriching}
                      className="px-3 py-2 border border-border text-foreground rounded-lg hover:bg-secondary disabled:opacity-50 transition-all flex items-center gap-2 text-sm"
                    >
                      <X size={14} />
                      Clear
                    </button>
                    <button
                      onClick={() => handleEnrich(true)}
                      disabled={isEnriching}
                      className="px-3 py-2 border border-border text-foreground rounded-lg hover:bg-secondary disabled:opacity-50 transition-all flex items-center gap-2 text-sm"
                    >
                      <RefreshCw size={14} />
                      Clear & Re-enrich
                    </button>
                  </>
                )}
                {!enrichmentData && (
                  <button
                    onClick={() => handleEnrich(false)}
                    disabled={isEnriching}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isEnriching ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        Enrich Now
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {enrichmentError && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{enrichmentError}</p>
              </div>
            )}

            {isEnriching && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">Fetching website data and analyzing with AI...</p>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            )}

            {enrichmentData && (
              <div className="space-y-6">
                {/* Fallback Warning Banner */}
                {enrichmentData.source === 'fallback-data' && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" size={20} />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300">AI Enrichment Unavailable</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                          AI service is currently unavailable. Showing fallback data based on company info. 
                          Results may be limited. Try again later for full AI analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Success Banner */}
                {enrichmentData.source === 'groq-ai-pipeline' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" size={20} />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-300">AI Analysis Complete</p>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                          Data enriched using AI based on live website analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Summary</h3>
                  <p className="text-muted-foreground">{enrichmentData.summary}</p>
                </div>

                {/* What They Do */}
                {enrichmentData.whatTheyDo && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">What They Do</h3>
                    <ul className="space-y-2">
                      {enrichmentData.whatTheyDo.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-foreground">
                          <CheckCircle2 size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Keywords */}
                {enrichmentData.keywords && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {enrichmentData.keywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-secondary text-foreground text-sm rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signals */}
                {enrichmentData.signals && enrichmentData.signals.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">Investment Signals</h3>
                      {enrichmentData.signalStrength && (
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          enrichmentData.signalStrength === 'Strong' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          enrichmentData.signalStrength === 'Moderate' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                          'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                        }`}>
                          {enrichmentData.signalStrength} Signals
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {enrichmentData.signals.map((signal, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/50">
                          {signal.detected ? (
                            <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
                          ) : (
                            <AlertCircle size={18} className="text-gray-400 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <span className="text-sm font-medium text-foreground">{signal.label}</span>
                            {signal.evidence && (
                              <p className="text-xs text-muted-foreground mt-0.5">{signal.evidence}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {enrichmentData.keyInsight && (
                      <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm text-primary font-medium">💡 {enrichmentData.keyInsight}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Investment Score & Thesis */}
                {enrichmentData.score && (
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">Investment Score</h3>
                      <div className="flex items-center gap-3">
                        <span className={`text-3xl font-bold ${
                          enrichmentData.score >= 70 ? 'text-green-600' :
                          enrichmentData.score >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {enrichmentData.score}
                        </span>
                        <span className={`px-3 py-1 text-lg font-bold rounded ${
                          enrichmentData.grade === 'A' ? 'bg-green-100 text-green-700' :
                          enrichmentData.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                          enrichmentData.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {enrichmentData.grade}
                        </span>
                      </div>
                    </div>
                    {enrichmentData.recommendation && (
                      <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                        enrichmentData.recommendation === 'Strong Buy' ? 'bg-green-600 text-white' :
                        enrichmentData.recommendation === 'Buy' ? 'bg-green-100 text-green-700' :
                        enrichmentData.recommendation === 'Hold' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {enrichmentData.recommendation}
                      </span>
                    )}
                    {enrichmentData.thesis && (
                      <p className="text-sm text-muted-foreground mt-3">{enrichmentData.thesis}</p>
                    )}
                  </div>
                )}

                {/* Strengths & Risks */}
                {(enrichmentData.strengths?.length > 0 || enrichmentData.risks?.length > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {enrichmentData.strengths?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">✅ Strengths</h3>
                        <ul className="space-y-1">
                          {enrichmentData.strengths.map((item, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {enrichmentData.risks?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">⚠️ Risks</h3>
                        <ul className="space-y-1">
                          {enrichmentData.risks.map((item, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Next Steps */}
                {enrichmentData.nextSteps?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">📋 Due Diligence Next Steps</h3>
                    <ul className="space-y-1">
                      {enrichmentData.nextSteps.map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">{idx + 1}. {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Competitors */}
                {enrichmentData.competitors && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Competitors</h3>
                    <div className="flex flex-wrap gap-2">
                      {enrichmentData.competitors.map((comp, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-full">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Market & Tech Stack */}
                <div className="grid grid-cols-2 gap-4">
                  {(enrichmentData.targetCustomers || enrichmentData.targetMarket) && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Target Customers</h3>
                      <p className="text-sm text-muted-foreground">{enrichmentData.targetCustomers || enrichmentData.targetMarket}</p>
                    </div>
                  )}
                  {enrichmentData.fundingStage && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Funding Stage</h3>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
                        {enrichmentData.fundingStage}
                      </span>
                    </div>
                  )}
                </div>

                {/* Business Model & Market Position */}
                <div className="grid grid-cols-2 gap-4">
                  {enrichmentData.businessModel && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Business Model</h3>
                      <p className="text-sm text-muted-foreground">{enrichmentData.businessModel}</p>
                    </div>
                  )}
                  {enrichmentData.marketPosition && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Market Position</h3>
                      <p className="text-sm text-muted-foreground">{enrichmentData.marketPosition}</p>
                    </div>
                  )}
                </div>

                {/* Tech Stack */}
                {enrichmentData.techStack && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {enrichmentData.techStack.map((tech, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enrichment Metadata & Sources */}
                <div className="pt-4 border-t border-border space-y-2">
                  {enrichmentData.sources && enrichmentData.sources.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Data Sources:</p>
                      <div className="flex flex-wrap gap-1">
                        {enrichmentData.sources.map((source, idx) => (
                          <a 
                            key={idx} 
                            href={source} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-0.5 bg-secondary rounded text-primary hover:underline"
                          >
                            {new URL(source).pathname || '/'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enriched: {enrichmentData.enrichedAt ? new Date(enrichmentData.enrichedAt).toLocaleString() : 'Unknown'} 
                    {enrichmentData.source && ` • Pipeline: ${enrichmentData.source}`}
                    {enrichmentData.websiteScraped && ' • ✓ Website scraped'}
                  </p>
                </div>

                {/* Export */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('json')}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Download size={16} />
                    Export JSON
                  </button>
                  <button
                    onClick={() => handleExport('txt')}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Download size={16} />
                    Export Text
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notes */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Notes</h2>
            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this company..."
                  className="w-full h-32 p-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="flex-1 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingNotes(true)}
                className="p-3 bg-secondary rounded-lg min-h-32 cursor-pointer hover:bg-muted transition-colors"
              >
                {notes ? (
                  <p className="text-foreground whitespace-pre-wrap">{notes}</p>
                ) : (
                  <p className="text-muted-foreground">Click to add notes...</p>
                )}
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Info</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Signals</p>
                <p className="text-2xl font-bold text-primary">{company.signals}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    company.enriched
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {company.enriched ? 'Enriched' : 'Not enriched'}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="font-semibold text-foreground">{company.employees}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
