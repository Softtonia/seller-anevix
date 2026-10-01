import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Loader2, Search, AlertCircle } from 'lucide-react';

const HsnAutocompleteSelect = ({ value, onChange }) => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  
  // Initialize input when value changes (e.g. initial load or controlled reset)
  useEffect(() => {
    if (value && !query && options.length === 0) {
      // If we only have the ID, we might need to fetch the specific HSN code details to display
      // For now, we'll just set the query to the value. 
      setQuery(value);
    }
  }, [value, query, options.length]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced API call
  useEffect(() => {
    if (!query) {
      setOptions([]);
      setIsOpen(false);
      return;
    }

    // Only search if the query is different from the currently selected value 
    // (prevents searching again when an option is just selected)
    if (query === value) {
       return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`https://hsn.krakelabsindia.com/api/lookup?code=${encodeURIComponent(query)}`);
        setOptions(response.data.results || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Failed to fetch HSN codes:', err);
        setError('Failed to fetch HSN codes');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, value]);

  const handleSelect = (option) => {
    setQuery(option.hsn_sac);
    setIsOpen(false);
    onChange(option.hsn_sac);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (!isOpen && e.target.value) setIsOpen(true);
    if (e.target.value === '') onChange('');
  };

  return (
    <div style={styles.wrapper} ref={dropdownRef}>
      <div style={styles.inputContainer}>
        <div style={styles.searchIconWrapper}>
          <Search size={18} color="#94a3b8" />
        </div>
        <input
          ref={inputRef}
          type="text"
          style={styles.input}
          placeholder="Search HSN Code or description..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (options.length > 0) setIsOpen(true);
          }}
        />
        <div style={styles.rightIconWrapper}>
          {loading && <Loader2 size={18} color="#3b82f6" className="animate-spin" />}
          {error && <AlertCircle size={18} color="#ef4444" title={error} />}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={styles.dropdown}>
          {error ? (
            <div style={styles.noResults}>{error}</div>
          ) : options.length === 0 && !loading ? (
            <div style={styles.noResults}>No results found.</div>
          ) : (
            options.map((option, idx) => (
              <div
                key={option.hsn_sac || idx}
                style={styles.option}
                onClick={() => handleSelect(option)}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                <div style={styles.optionContent}>
                  <span style={styles.hsnCode}>
                    {option.hsn_sac}
                  </span>
                  <span style={styles.description} title={option.description}>
                    {option.description}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    position: 'relative',
    width: '100%',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '10px 36px 10px 40px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#334155',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  searchIconWrapper: {
    position: 'absolute',
    left: '12px',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  rightIconWrapper: {
    position: 'absolute',
    right: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    zIndex: 1000,
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '6px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  noResults: {
    padding: '14px 16px',
    color: '#64748b',
    fontSize: '14px',
    textAlign: 'center',
  },
  option: {
    padding: '12px 16px',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    transition: 'background-color 0.15s ease',
    borderBottom: '1px solid #f8fafc',
  },
  optionContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  hsnCode: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: '14px',
    flexShrink: 0,
  },
  description: {
    color: '#64748b',
    fontSize: '13px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
};

export default HsnAutocompleteSelect;
