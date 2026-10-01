import React, { useState, useEffect, useRef } from 'react';
import './FormElement.css';

export default function FormElement({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  icon = null,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword = null,
  VisibilityIcon = null,
  VisibilityOffIcon = null,
  label = '',
  labelClassName = '',
  options = [],
  checked,
  className = '',
  maxLength,
  ...rest
}) {
  const selectedOption = options.find((opt) => opt.value === value);
  const [inputValue, setInputValue] = useState(selectedOption ? selectedOption.label : '');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync input text with value prop updates from parent
  useEffect(() => {
    const selected = options.find((opt) => opt.value === value);
    setInputValue(selected ? selected.label : '');
  }, [value, options]);

  // Click outside handler for searchable select
  useEffect(() => {
    if (type !== 'searchable-select') return;

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // Revert input text to selected option label if it doesn't match
        const selected = options.find((opt) => opt.value === value);
        setInputValue(selected ? selected.label : '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [type, value, options]);

  const handleSelectOption = (opt) => {
    setInputValue(opt.label);
    if (onChange) {
      onChange({
        target: {
          name,
          value: opt.value,
          type: 'select-one'
        }
      });
    }
    setIsOpen(false);
  };

  // Filter options based on inputValue
  const filteredOptions = options.filter((opt) => {
    const isMatchingSelected = selectedOption && inputValue === selectedOption.label;
    if (isMatchingSelected) {
      return true; // Show all options when focused on already selected option
    }
    return opt.label.toLowerCase().includes(inputValue.toLowerCase());
  });

  const renderLabel = () => {
    if (!label) return null;
    return (
      <label className={`form-element-label ${labelClassName}`}>
        {label}
      </label>
    );
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={error ? 'form-input form-input-error' : 'form-input'}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'searchable-select':
        return (
          <div className="searchable-select-container" ref={dropdownRef}>
            <div className="form-input-container">
              <input
                type="text"
                name={name}
                placeholder={placeholder || 'Select...'}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className={error ? 'form-input form-input-error' : 'form-input'}
                autoComplete="off"
              />
              <button
                type="button"
                className="searchable-select-arrow-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle dropdown"
              >
                <svg 
                  className={`searchable-select-arrow-icon ${isOpen ? 'open' : ''}`}
                  width="12" 
                  height="8" 
                  viewBox="0 0 12 8" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {isOpen && (
              <div className="searchable-select-dropdown">
                <ul className="searchable-select-options">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((opt) => (
                      <li
                        key={opt.value}
                        className={`searchable-select-option ${value === opt.value ? 'selected' : ''}`}
                        onClick={() => handleSelectOption(opt)}
                      >
                        {opt.label}
                      </li>
                    ))
                  ) : (
                    <li className="searchable-select-no-results">No results found</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="form-checkbox-wrapper">
            <label className={`form-checkbox-label ${labelClassName || ''}`}>
              <input
                type="checkbox"
                name={name}
                checked={checked !== undefined ? checked : !!value}
                onChange={onChange}
                className="form-checkbox-input"
              />
              <span className="checkbox-text">{label || placeholder}</span>
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="form-radio-group">
            {options.map((opt) => (
              <label key={opt.value} className={`form-radio-label ${labelClassName || ''}`}>
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={onChange}
                  className="form-radio-input"
                />
                <span className="radio-text Poppins-regular">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <div className="form-input-container">
            <input
              type={type}
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              required={required}
              maxLength={maxLength}
              className={error ? 'form-input form-input-error' : 'form-input'}
              {...rest}
            />
            {icon && <span className="form-icon">{icon}</span>}
            {showPasswordToggle && onTogglePassword && (
              <button
                type="button"
                className="password-toggle-btn"
                onClick={onTogglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`form-element-wrapper ${className} ${error ? 'has-error' : ''}`}>
      {type !== 'checkbox' && renderLabel()}
      {renderInput()}
      {error && <span className="form-error-msg">{error}</span>}
    </div>
  );
}
