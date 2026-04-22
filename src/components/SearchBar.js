import React, { useState } from 'react';
import { Form, InputGroup, Button, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({ 
  placeholder = "Search millions of parts by number",
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
      const params = new URLSearchParams();
      params.append('q', searchQuery.trim());
      if (currentCategory) {
        params.append('category', currentCategory);
      }
      const subcategory = searchParams.get('subcategory');
      if (subcategory) {
        params.append('subcategory', subcategory);
      }
      navigate(`/search?${params.toString()}`);
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
            value={searchQuery}
            placeholder="Search from millions of parts in stock and available"
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search from millions of parts in stock and available"
          />
          <Button type="submit" variant="primary">
            <FontAwesomeIcon icon={faSearch} className="me-2 d-none d-sm-inline" />
            <span>Search</span>
          </Button>
        </InputGroup>
      </Form>
    </>
  );
};

export default SearchBar;
