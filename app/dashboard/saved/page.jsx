'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Trash2, ExternalLink, Zap } from 'lucide-react';
import { mockCompanies } from '@/lib/mockData';
import { storage } from '@/lib/storage';

export default function SavedPage() {
  const [savedCompanyIds, setSavedCompanyIds] = useState([]);
  const [enrichedCompanies, setEnrichedCompanies] = useState([]);

  useEffect(() => {
    // Load saved companies
    setSavedCompanyIds(storage.getSavedCompanies());
    
    // Check which companies have enrichment data
    const enrichedIds = mockCompanies
      .filter(company => {
        const cached = localStorage.getItem(`enrichment-${company.id}`);
        return cached !== null;
      })
      .map(company => company.id);
    setEnrichedCompanies(enrichedIds);
  }, []);

  const savedCompanies = mockCompanies.filter(company => 
    savedCompanyIds.includes(company.id)
  );

  const removeSaved = (companyId) => {
    const updated = storage.toggleSavedCompany(companyId);
    setSavedCompanyIds(updated);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saved Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {savedCompanies.length} {savedCompanies.length === 1 ? 'company' : 'companies'} saved
          </p>
        </div>
      </div>

      {savedCompanies.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Star size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No saved companies yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Save companies from the Companies page to track them here.
          </p>
          <Link
            href="/dashboard/companies"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            Browse Companies
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {savedCompanies.map((company) => {
            const isEnriched = enrichedCompanies.includes(company.id);
            return (
              <div
                key={company.id}
                className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/companies/${company.id}`}
                        className="text-lg font-semibold text-primary hover:underline"
                      >
                        {company.name}
                      </Link>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isEnriched
                          ? 'bg-emerald-900/30 text-emerald-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {isEnriched ? 'Enriched' : 'Not enriched'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{company.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                        {company.industry}
                      </span>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                        {company.location}
                      </span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Visit website <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/companies/${company.id}`}
                      className="p-2 text-primary hover:bg-secondary rounded-lg transition-colors"
                      title="View & Enrich"
                    >
                      <Zap size={18} />
                    </Link>
                    <button
                      onClick={() => removeSaved(company.id)}
                      className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
