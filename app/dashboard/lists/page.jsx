'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Download, X } from 'lucide-react';
import { mockCompanies } from '@/lib/mockData';

export default function ListsPage() {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    const savedLists = localStorage.getItem('lists');
    if (savedLists) {
      setLists(JSON.parse(savedLists));
    }
  }, []);

  const saveLists = (newLists) => {
    setLists(newLists);
    localStorage.setItem('lists', JSON.stringify(newLists));
  };

  const createNewList = () => {
    if (!newListName.trim()) return;
    const newList = {
      id: Date.now(),
      name: newListName,
      companies: [],
    };
    saveLists([...lists, newList]);
    setNewListName('');
    setShowNewListModal(false);
    setSelectedListId(newList.id);
  };

  const deleteList = (listId) => {
    saveLists(lists.filter((l) => l.id !== listId));
    if (selectedListId === listId) {
      setSelectedListId(null);
    }
  };

  const removeCompanyFromList = (listId, companyId) => {
    const updated = lists.map((l) =>
      l.id === listId
        ? { ...l, companies: l.companies.filter((c) => c !== companyId) }
        : l
    );
    saveLists(updated);
  };

  const exportList = (list, format) => {
    const listCompanies = mockCompanies.filter((c) => list.companies.includes(c.id));
    let content;

    if (format === 'csv') {
      const headers = ['Name', 'Industry', 'Location', 'Website', 'Employees'];
      const rows = listCompanies.map((c) => [
        `"${c.name}"`,
        `"${c.industry}"`,
        `"${c.location}"`,
        `"${c.website}"`,
        c.employees,
      ]);
      content = [headers, ...rows].map((row) => row.join(',')).join('\n');
    } else {
      content = JSON.stringify(
        {
          listName: list.name,
          exportedAt: new Date().toISOString(),
          companies: listCompanies.map((c) => ({
            id: c.id,
            name: c.name,
            industry: c.industry,
            location: c.location,
            website: c.website,
            employees: c.employees,
            description: c.description,
          })),
        },
        null,
        2
      );
    }

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', `${list.name.replace(/\s+/g, '-').toLowerCase()}.${format}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const selectedList = lists.find((l) => l.id === selectedListId);
  const selectedListCompanies = selectedList
    ? mockCompanies.filter((c) => selectedList.companies.includes(c.id))
    : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Lists</h1>
        <button
          onClick={() => setShowNewListModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
        >
          <Plus size={18} />
          New List
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Lists Sidebar */}
        <div className="col-span-1">
          <div className="space-y-2">
            {lists.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No lists yet</p>
            ) : (
              lists.map((list) => (
                <div
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedListId === list.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{list.name}</h3>
                      <p className={`text-sm ${selectedListId === list.id ? 'opacity-80' : 'text-muted-foreground'}`}>
                        {list.companies.length} companies
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteList(list.id);
                      }}
                      className={`p-1 rounded hover:bg-accent transition-colors ${
                        selectedListId === list.id ? 'hover:bg-primary-foreground/20' : ''
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* List Details */}
        <div className="col-span-2">
          {selectedList ? (
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">{selectedList.name}</h2>
                {selectedListCompanies.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportList(selectedList, 'csv')}
                      className="flex items-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <Download size={16} />
                      CSV
                    </button>
                    <button
                      onClick={() => exportList(selectedList, 'json')}
                      className="flex items-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <Download size={16} />
                      JSON
                    </button>
                  </div>
                )}
              </div>

              {selectedListCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No companies in this list yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Save companies from the Companies page to add them here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedListCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{company.name}</h3>
                        <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                          <span>{company.industry}</span>
                          <span>•</span>
                          <span>{company.location}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeCompanyFromList(selectedList.id, company.id)}
                        className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <p className="text-muted-foreground">Select a list to view companies</p>
            </div>
          )}
        </div>
      </div>

      {/* New List Modal */}
      {showNewListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Create New List</h2>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name..."
              className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              onKeyPress={(e) => e.key === 'Enter' && createNewList()}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={createNewList}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-medium"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewListModal(false);
                  setNewListName('');
                }}
                className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
