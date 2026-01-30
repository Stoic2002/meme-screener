// Search bar component

import { useState, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useCoinStore } from '../../stores';

export function SearchBar() {
    const [value, setValue] = useState('');
    const { setFilters, searchCoins } = useCoinStore();

    const handleSearch = useCallback((searchValue: string) => {
        setFilters({ search: searchValue });
        if (searchValue.length >= 3) {
            searchCoins(searchValue);
        }
    }, [setFilters, searchCoins]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        handleSearch(newValue);
    };

    const handleClear = () => {
        setValue('');
        setFilters({ search: '' });
        searchCoins('');
    };

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <FiSearch
                size={16}
                style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                }}
            />
            <input
                type="text"
                className="input"
                placeholder="Search token name, symbol, or address..."
                value={value}
                onChange={handleChange}
                style={{ paddingLeft: '40px', paddingRight: value ? '40px' : '14px' }}
            />
            {value && (
                <button
                    onClick={handleClear}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                    }}
                >
                    <FiX size={16} />
                </button>
            )}
        </div>
    );
}
