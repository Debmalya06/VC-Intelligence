// localStorage helper functions for VC Intelligence dashboard

export const storage = {
  // Saved Companies
  getSavedCompanies: () => {
    try {
      const saved = localStorage.getItem('savedCompanies');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  setSavedCompanies: (companies) => {
    localStorage.setItem('savedCompanies', JSON.stringify(companies));
  },

  toggleSavedCompany: (companyId) => {
    const saved = storage.getSavedCompanies();
    const updated = saved.includes(companyId)
      ? saved.filter((id) => id !== companyId)
      : [...saved, companyId];
    storage.setSavedCompanies(updated);
    return updated;
  },

  // Company Notes
  getNotes: (companyId) => {
    try {
      return localStorage.getItem(`notes-${companyId}`) || '';
    } catch {
      return '';
    }
  },

  setNotes: (companyId, notes) => {
    localStorage.setItem(`notes-${companyId}`, notes);
  },

  // Enrichment Cache
  getEnrichmentCache: (companyId) => {
    try {
      const cached = localStorage.getItem(`enrichment-${companyId}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  setEnrichmentCache: (companyId, data) => {
    const cacheData = {
      ...data,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(`enrichment-${companyId}`, JSON.stringify(cacheData));
  },

  // Lists
  getLists: () => {
    try {
      const saved = localStorage.getItem('lists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  setLists: (lists) => {
    localStorage.setItem('lists', JSON.stringify(lists));
  },

  createList: (name) => {
    const lists = storage.getLists();
    const newList = {
      id: Date.now(),
      name,
      companies: [],
      createdAt: new Date().toISOString(),
    };
    lists.push(newList);
    storage.setLists(lists);
    return newList;
  },

  addToList: (listId, companyId) => {
    const lists = storage.getLists();
    const list = lists.find(l => l.id === listId);
    if (list && !list.companies.includes(companyId)) {
      list.companies.push(companyId);
      storage.setLists(lists);
    }
    return lists;
  },

  removeFromList: (listId, companyId) => {
    const lists = storage.getLists();
    const list = lists.find(l => l.id === listId);
    if (list) {
      list.companies = list.companies.filter(id => id !== companyId);
      storage.setLists(lists);
    }
    return lists;
  },

  getCompanyLists: (companyId) => {
    const lists = storage.getLists();
    return lists.filter(list => list.companies.includes(companyId));
  },

  deleteList: (listId) => {
    const lists = storage.getLists().filter(l => l.id !== listId);
    storage.setLists(lists);
    // Also remove from compare lists if present
    storage.removeFromCompare(listId);
    return lists;
  },

  // Compare Lists
  getCompareLists: () => {
    try {
      const saved = localStorage.getItem('compareLists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  setCompareLists: (listIds) => {
    localStorage.setItem('compareLists', JSON.stringify(listIds));
  },

  addToCompare: (listId) => {
    const compareLists = storage.getCompareLists();
    if (!compareLists.includes(listId)) {
      compareLists.push(listId);
      storage.setCompareLists(compareLists);
    }
    return compareLists;
  },

  removeFromCompare: (listId) => {
    const compareLists = storage.getCompareLists().filter(id => id !== listId);
    storage.setCompareLists(compareLists);
    return compareLists;
  },

  isInCompare: (listId) => {
    return storage.getCompareLists().includes(listId);
  },

  clearCompare: () => {
    storage.setCompareLists([]);
  },

  // Saved Searches
  getSavedSearches: () => {
    try {
      const saved = localStorage.getItem('savedSearches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  setSavedSearches: (searches) => {
    localStorage.setItem('savedSearches', JSON.stringify(searches));
  },

  // User Preferences
  getUserPreferences: () => {
    try {
      const saved = localStorage.getItem('userPreferences');
      return saved
        ? JSON.parse(saved)
        : {
            sortBy: 'name',
            sortOrder: 'asc',
            itemsPerPage: 10,
          };
    } catch {
      return { sortBy: 'name', sortOrder: 'asc', itemsPerPage: 10 };
    }
  },

  setUserPreferences: (prefs) => {
    localStorage.setItem('userPreferences', JSON.stringify(prefs));
  },

  // Clear all data (for testing/resetting)
  clearAll: () => {
    localStorage.clear();
  },
};
