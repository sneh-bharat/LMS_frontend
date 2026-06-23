'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Search, UserCheck, X } from 'lucide-react';
import {
  fetchSearchedAdministrators,
  type AllAdministratorItem,
} from '@/app/Apis/administrator/AdministratorApis';
import { listingSearchInput } from '@/lib/listingPageStyles';

const SEARCH_DEBOUNCE_MS = 350;
const MIN_USERNAME_LEN = 2;

export interface AdminSearchOption {
  id: number;
  fullName: string;
  email: string;
  username: string;
}

interface AdminSearchAutocompleteProps {
  sourceRows: AdminSearchOption[];
  disabled?: boolean;
  onSearchResult: (items: AllAdministratorItem[], username: string) => void;
  onSearchClear: () => void;
}

function adminDisplayName(admin: AdminSearchOption): string {
  return admin.fullName && admin.fullName !== '-' ? admin.fullName : admin.username;
}

export default function AdminSearchAutocomplete({
  sourceRows,
  disabled = false,
  onSearchResult,
  onSearchClear,
}: AdminSearchAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchKey, setSearchKey] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchKey.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchKey]);

  const localSuggestions = useMemo(() => {
    const term = searchKey.trim().toLowerCase();
    if (term.length < MIN_USERNAME_LEN) return [];

    return sourceRows
      .filter((row) => {
        const haystack = [row.fullName, row.email, row.username].join(' ').toLowerCase();
        return haystack.includes(term);
      })
      .slice(0, 8);
  }, [searchKey, sourceRows]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const runUsernameSearch = async (username: string) => {
    const trimmed = username.trim();
    if (trimmed.length < MIN_USERNAME_LEN) {
      onSearchClear();
      return;
    }

    setLoading(true);
    setSearchError(null);

    try {
      const response = await fetchSearchedAdministrators({ username: trimmed });

      if (response.items.length === 0) {
        setSearchError(`No administrator found for username "${trimmed}".`);
        onSearchResult([], trimmed);
      } else {
        onSearchResult(response.items, trimmed);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to search administrator.';
      setSearchError(message);
      onSearchResult([], trimmed);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!debouncedSearch) {
      setSearchError(null);
      onSearchClear();
      return;
    }

    void runUsernameSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to debounced query
  }, [debouncedSearch]);

  const handleSelect = (admin: AdminSearchOption) => {
    setSearchKey(admin.username);
    setDebouncedSearch(admin.username);
    void runUsernameSearch(admin.username);
  };

  const handleClear = () => {
    setSearchKey('');
    setDebouncedSearch('');
    setSearchError(null);
    setOpen(false);
    onSearchClear();
  };

  const showDropdown =
    open && !loading && searchKey.trim().length >= MIN_USERNAME_LEN && localSuggestions.length > 0;

  return (
    <div ref={containerRef} className="relative flex-1 group w-full min-w-0">
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none z-10"
        size={16}
        aria-hidden
      />
      <input
        type="search"
        value={searchKey}
        onChange={(e) => {
          setSearchKey(e.target.value);
          setOpen(true);
          setSearchError(null);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            void runUsernameSearch(searchKey);
          }
          if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        placeholder="Search by username (autocomplete)…"
        className={`${listingSearchInput} pr-10`}
        aria-label="Search admins by username"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
      />
      {loading ? (
        <Loader2
          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin"
          size={16}
          aria-hidden
        />
      ) : searchKey ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold"
          aria-label="Clear search"
        >
          <X size={14} aria-hidden />
        </button>
      ) : null}

      {showDropdown ? (
        <ul
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1"
          role="listbox"
          aria-label="Administrator suggestions"
        >
          {localSuggestions.map((admin) => (
            <li key={admin.id} role="option">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(admin)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-emerald-50 transition-colors"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-emerald-700">
                  <UserCheck size={14} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-800 truncate">
                    {adminDisplayName(admin)}
                  </span>
                  <span className="block text-xs text-slate-500 truncate">
                    @{admin.username}
                    {admin.email !== '-' ? ` · ${admin.email}` : ''}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {searchError ? (
        <p className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {searchError}
        </p>
      ) : null}
    </div>
  );
}
