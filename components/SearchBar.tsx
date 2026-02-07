'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlass, X } from './Icons';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = '検索...' }: SearchBarProps) {
    const [query, setQuery] = useState('');

    // Debounce search to avoid too many re-renders
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <div className={styles.searchBar}>
            <div className={styles.searchIcon}>
                <MagnifyingGlass size={20} color="var(--text-muted)" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className={styles.searchInput}
            />
            {query && (
                <button
                    onClick={handleClear}
                    className={styles.clearButton}
                    aria-label="検索をクリア"
                >
                    <X size={16} color="var(--text-muted)" />
                </button>
            )}
        </div>
    );
}
