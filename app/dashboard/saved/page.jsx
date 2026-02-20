'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Play, X, Plus, Search } from 'lucide-react';

export default function SavedSearchesPage() {
  const router = useRouter();
  const [savedSearches, setSavedSearches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  const deleteSearch = (searchId) => {
    const updated = savedSearches.filter((s) => s.id !== searchId);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const runSearch = (search) => {
    const params = new URLSearchParams();
    if (search.query) params.append('q', search.query);
    if (search.filters.industry) params.append('industry', search.filters.industry);
    if (search.filters.location) params.append('location', search.filters.location);
    router.push(`/dashboard/companies?${params.toString()}`);
  };

  const saveNewSearch = () => {
    if (!newSearchName.trim()) return;

    const newSearch = {
      id: Date.now(),
      query: newSearchName.trim(),
      filters: { 
        industry: newIndustry.trim(), 
        location: newLocation.trim() 
      },
      savedAt: new Date().toISOString(),
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    
    // Reset form
    setNewSearchName('');
    setNewIndustry('');
    setNewLocation('');
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Saved Searches</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          New Search
        </button>
      </div>

      {savedSearches.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Search size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No saved searches yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create saved searches to quickly filter companies by industry, location, or keywords.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            Create Your First Search
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Search Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Filters</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date Saved</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {savedSearches.map((search) => (
                <tr key={search.id} className="border-b border-border hover:bg-secondary transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground">{search.query}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      {search.filters.industry && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded">
                          {search.filters.industry}
                        </span>
                      )}
                      {search.filters.location && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded">
                          {search.filters.location}
                        </span>
                      )}
                      {!search.filters.industry && !search.filters.location && (
                        <span className="text-muted-foreground text-sm">All companies</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(search.savedAt)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => runSearch(search)}
                        className="p-2 text-primary hover:bg-secondary rounded-lg transition-colors"
                        title="Run search"
                      >
                        <Play size={18} />
                      </button>
                      <button
                        onClick={() => deleteSearch(search.id)}
                        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete search"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Create Saved Search</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Search Name *
                </label>
                <input
                  type="text"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  placeholder="e.g., AI Startups in SF"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Industry Filter (optional)
                </label>
                <select
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Industries</option>
                  <option value="SaaS">SaaS</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Fintech">Fintech</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Dev Tools">Dev Tools</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Location Filter (optional)
                </label>
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Locations</option>
                  <option value="SF">SF</option>
                  <option value="NYC">NYC</option>
                  <option value="Austin">Austin</option>
                  <option value="Boston">Boston</option>
                  <option value="Seattle">Seattle</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveNewSearch}
                disabled={!newSearchName.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                Save Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
