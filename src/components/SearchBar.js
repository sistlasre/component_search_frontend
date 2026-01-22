import React, { useState } from 'react';
import { Form, InputGroup, Button, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({ 
  placeholder = "Search millions of parts by number, keyword, or description...", 
  className = "",
  defaultCategory = null  // Optional default category to use
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Try to get category from current URL or use default
  const currentCategory = searchParams.get('category') || defaultCategory;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (currentCategory) {
        // If we have a category, include it in the search
        const params = new URLSearchParams();
        params.append('category', currentCategory);
        params.append('q', searchQuery.trim());
        
        // Preserve subcategory if it exists
        const subcategory = searchParams.get('subcategory');
        if (subcategory) {
          params.append('subcategory', subcategory);
        }
        
        navigate(`/search?${params.toString()}`);
      } else {
        // Show warning if no category is available
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 5000);
      }
    }
  };

  return (
    <>
      {showWarning && (
        <Alert variant="warning" dismissible onClose={() => setShowWarning(false)} className="mb-2">
          Please select a category first to search for parts.
        </Alert>
      )}
      <Form onSubmit={handleSubmit} className={className}>
        <InputGroup className="search-bar-hero">
          <Form.Control
            type="search"
            placeholder={currentCategory ? placeholder : "Select a category first, then search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search for electronic parts"
          />
          <Button type="submit" variant="primary">
            <FontAwesomeIcon icon={faSearch} className="me-2 d-none d-sm-inline" />
            <span>Search</span>
          </Button>
        </InputGroup>
        {!currentCategory && (
          <small className="text-muted">Tip: Navigate to a category first, then search within it.</small>
        )}
      </Form>
    </>
  );
};

export default SearchBar;
