import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({ placeholder = "Search millions of parts by number, keyword, or description...", className = "" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className={className}>
      <InputGroup className="search-bar-hero">
        <Form.Control
          type="search"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search for electronic parts"
        />
        <Button type="submit" variant="primary">
          <FontAwesomeIcon icon={faSearch} className="me-2 d-none d-sm-inline" />
          <span>Search</span>
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;