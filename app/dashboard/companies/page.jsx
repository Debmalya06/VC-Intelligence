'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronUp, ChevronDown, Save, Plus, Star } from 'lucide-react';
import { mockCompanies, industries, locations } from '@/lib/mockData';
import { storage } from '@/lib/storage';

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [savedCompanies, setSavedCompanies] = useState([]);
  const [enrichedCompanies, setEnrichedCompanies] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Load saved companies and enrichment status from localStorage
  useEffect(() => {
    setSavedCompanies(storage.getSavedCompanies());
    
    // Check which companies have enrichment data
    const enrichedIds = mockCompanies
      .filter(company => {
        const cached = localStorage.getItem(`enrichment-${company.id}`);
        return cached !== null;
      })
      .map(company => company.id);
    setEnrichedCompanies(enrichedIds);
  }, []);

  const itemsPerPage = 10;

  const filteredCompanies = useMemo(() => {
    let filtered = mockCompanies.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = !industryFilter || company.industry === industryFilter;
      const matchesLocation = !locationFilter || company.location === locationFilter;
      const matchesSaved = !showSavedOnly || savedCompanies.includes(company.id);
      return matchesSearch && matchesIndustry && matchesLocation && matchesSaved;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    return filtered;
  }, [searchQuery, industryFilter, locationFilter, sortKey, sortOrder, showSavedOnly, savedCompanies]);

  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(start, start + itemsPerPage);
  }, [filteredCompanies, currentPage]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  const toggleSave = (companyId) => {
    const updated = storage.toggleSavedCompany(companyId);
    setSavedCompanies(updated);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search companies, keywords…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          <select
            value={industryFilter}
            onChange={(e) => {
              setIndustryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {(industryFilter || locationFilter) && (
            <button
              onClick={() => {
                setIndustryFilter('');
                setLocationFilter('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-secondary transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {filteredCompanies.length} companies found
        </p>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Company Name
                  {sortKey === 'name' && (sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                <button
                  onClick={() => handleSort('industry')}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Industry
                  {sortKey === 'industry' && (sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Location</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Signals</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCompanies.map((company) => (
              <tr
                key={company.id}
                className="border-b border-border hover:bg-secondary transition-colors"
              >
                <td className="px-4 py-4">
                  <Link
                    href={`/dashboard/companies/${company.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {company.name}
                  </Link>
                </td>
                <td className="px-4 py-4 text-sm text-foreground">{company.industry}</td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{company.location}</td>
                <td className="px-4 py-4 text-center text-sm font-medium text-foreground">
                  {company.signals || 0}
                </td>
                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      enrichedCompanies.includes(company.id)
                        ? 'bg-emerald-900/30 text-emerald-400'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {enrichedCompanies.includes(company.id) ? 'Enriched' : 'Not enriched'}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => toggleSave(company.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      savedCompanies.includes(company.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <Save size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-border hover:bg-secondary disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded border transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-secondary'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-border hover:bg-secondary disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
