import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSort, faTimes } from '@fortawesome/free-solid-svg-icons';
import SEO from './SEO';
import SearchBar from './SearchBar';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get URL parameters
  const query = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';
  const subcategoryFilter = searchParams.get('subcategory') || '';
  const manufacturerFilter = searchParams.get('manufacturer') || '';
  
  // State for API data
  const [results, setResults] = useState([]);
  const [facets, setFacets] = useState({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Parse filters from URL (these are the applied filters)
  const selectedFilters = {};
  searchParams.forEach((value, key) => {
    if (key !== 'category' && key !== 'subcategory' && key !== 'q') {
      selectedFilters[key] = value.split('||');
    }
  });
  
  // State for pending filters (before applying)
  const [pendingFilters, setPendingFilters] = useState(selectedFilters);
  const [sortBy, setSortBy] = useState('relevance');

  // Build API URL with all parameters from URL
  const buildApiUrl = useCallback(() => {
    const baseUrl = 'https://obkg1pw61g.execute-api.us-west-2.amazonaws.com/prod/cs/search';
    const params = new URLSearchParams();
    
    // Either category OR q is required
    if (!categoryFilter && !query && !manufacturerFilter) {
      return null;
    }
    
    if (categoryFilter) {
      params.append('category', categoryFilter);
    }
    
    // Subcategory is optional
    if (subcategoryFilter) {
      params.append('subcategory', subcategoryFilter);
    }
    
    // Add all other URL parameters (facet filters) - they're already properly formatted
    searchParams.forEach((value, key) => {
      if (key !== 'category' && key !== 'subcategory' && key !== 'q') {
        params.append(key, value);
      }
    });
    
    // Add search query if present
    if (query) {
      params.append('q', query);
    }
    
    return `${baseUrl}?${params.toString()}`;
  }, [categoryFilter, subcategoryFilter, manufacturerFilter, searchParams, query]);

  // Update pending filters when URL changes
  useEffect(() => {
    setPendingFilters(selectedFilters);
  }, [searchParams]); // Update when URL params change

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      const url = buildApiUrl();
      
      if (!url) {
        setError('Either a search term or category is required');
        setResults([]);
        setFacets({});
        setTotal(0);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Set results and facets from API response
        setResults(data.results || []);
        setFacets(data.facets || {});
        setTotal(data.total || 0);
        
      } catch (err) {
        setError(err.message);
        setResults([]);
        setFacets({});
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [buildApiUrl]); // Refetch when buildApiUrl changes (which depends on filters)

  // Update URL when filters change (without page refresh)
  const updateUrlParams = useCallback((newFilters) => {
    const params = new URLSearchParams();
    
    // Always keep category and subcategory
    if (categoryFilter) params.append('category', categoryFilter);
    if (subcategoryFilter) params.append('subcategory', subcategoryFilter);
    if (query) params.append('q', query);
    
    // Add selected filters as comma-separated values
    Object.entries(newFilters).forEach(([facetKey, values]) => {
      if (values && values.length > 0) {
        params.append(facetKey, values.join('||'));
      }
    });
    
    // Update URL without refreshing the page
    setSearchParams(params, { replace: true });
  }, [categoryFilter, subcategoryFilter, query, setSearchParams]);

  // Handle filter toggle for any facet (updates pending filters)
  const handleFilterToggle = (facetKey, value) => {
    const newFilters = { ...pendingFilters };
    
    if (!newFilters[facetKey]) {
      newFilters[facetKey] = [];
    }
    
    const index = newFilters[facetKey].indexOf(value);
    if (index > -1) {
      // Remove filter
      newFilters[facetKey].splice(index, 1);
      if (newFilters[facetKey].length === 0) {
        delete newFilters[facetKey];
      }
    } else {
      // Add filter
      newFilters[facetKey].push(value);
    }
    
    setPendingFilters(newFilters);
  };

  // Apply filters - updates URL and triggers API call
  const applyFilters = () => {
    updateUrlParams(pendingFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters = {};
    setPendingFilters(emptyFilters);
    setSortBy('relevance');
    updateUrlParams(emptyFilters);
  };
  
  // Check if a filter value is selected in pending filters
  const isFilterSelected = (facetKey, value) => {
    return pendingFilters[facetKey] && pendingFilters[facetKey].includes(value);
  };
  
  // Check if there are pending changes
  const hasPendingChanges = () => {
    return JSON.stringify(pendingFilters) !== JSON.stringify(selectedFilters);
  };
  
  // Remove a specific filter value
  const removeFilter = (facetKey, value) => {
    const newFilters = { ...selectedFilters };
    if (newFilters[facetKey]) {
      newFilters[facetKey] = newFilters[facetKey].filter(v => v !== value);
      if (newFilters[facetKey].length === 0) {
        delete newFilters[facetKey];
      }
    }
    updateUrlParams(newFilters);
  };
  
  // Convert filter key to human-readable format
  const formatFilterLabel = (key) => {
    // First check if we have a label from the facets
    if (facets[key]?.label) {
      return facets[key].label;
    }
    
    // Otherwise, format the key itself
    return key
      .replace(/_/g, ' ')  // Replace underscores with spaces
      .replace(/([A-Z])/g, ' $1')  // Add space before capital letters (for camelCase)
      .replace(/\b\w/g, (char) => char.toUpperCase())  // Capitalize first letter of each word
      .trim();
  };

  // Show prompt if no category AND no query
  if (!categoryFilter && !query && !manufacturerFilter) {
    return (
      <Container className="py-4">
        <div className="text-center py-5">
          <h3>Search for Components</h3>
          <p className="text-muted mb-4">Enter a search term or browse by category to find parts</p>
          <SearchBar />
          <Button variant="primary" as={Link} to="/" className="mt-3">
            Browse Categories
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <SEO 
        title={`Search Results${query ? ` for "${query}"` : ''}`}
        description={`Find electronic components and parts. ${total} results found.`}
        keywords="electronic components search, parts finder, component database"
      />

      <Container className="py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar />
        </div>

        {/* Results Header */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              {categoryFilter && `${categoryFilter}`}
              {subcategoryFilter && ` > ${subcategoryFilter}`}
              {query && ` - "${query}"`}
              <span className="text-muted ms-2">({total} results)</span>
            </h5>
            <Form.Select 
              style={{ width: 'auto' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={loading}
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock">Stock Availability</option>
            </Form.Select>
          </div>
          
          {/* Applied Filters Display */}
          {Object.keys(selectedFilters).length > 0 && (
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <span className="text-muted me-2">Applied Filters:</span>
              {Object.entries(selectedFilters).map(([facetKey, values]) => (
                values.map(value => {
                  const facetLabel = formatFilterLabel(facetKey);
                  return (
                    <Badge 
                      key={`${facetKey}-${value}`}
                      bg="secondary" 
                      className="d-flex align-items-center gap-2 py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <span>{facetLabel}: {value}</span>
                      <FontAwesomeIcon 
                        icon={faTimes} 
                        size="sm"
                        style={{ cursor: 'pointer' }}
                        onClick={() => removeFilter(facetKey, value)}
                      />
                    </Badge>
                  );
                })
              ))}
              {Object.keys(selectedFilters).length > 0 && (
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-danger p-0 ms-2"
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
        </div>

        <Row>
          {/* Filters Sidebar */}
          <Col lg={3} className="mb-4">
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>
                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                    Filters
                  </span>
                  <Button variant="link" size="sm" onClick={clearFilters} className="p-0">
                    Clear All
                  </Button>
                </div>
                {hasPendingChanges() && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-100"
                    onClick={applyFilters}
                    disabled={loading}
                  >
                    Apply Filters
                  </Button>
                )}
              </Card.Header>
              <Card.Body>
                {/* Current Category and Subcategory - Only show if we have a category */}
                {categoryFilter && (
                  <div className="mb-4">
                    <h6 className="mb-2">Current Selection</h6>
                    <div className="text-muted small">
                      <div>Category: <strong>{categoryFilter}</strong></div>
                      {subcategoryFilter && (
                        <div>Subcategory: <strong>{subcategoryFilter}</strong></div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dynamic Facets from API - Only show facets that have values */}
                {Object.entries(facets)
                  .filter(([_, facetData]) => facetData.values && facetData.values.length > 0)
                  .map(([facetKey, facetData]) => (
                    <div key={facetKey} className="mb-4">
                      <h6 className="mb-2">{formatFilterLabel(facetKey)}</h6>
                      {facetData.values.slice(0, 10).map(item => (
                        <Form.Check
                          key={item.value}
                          type="checkbox"
                          label={`${item.value} (${item.count})`}
                          checked={isFilterSelected(facetKey, item.value)}
                          onChange={() => handleFilterToggle(facetKey, item.value)}
                          disabled={loading}
                          className="mb-1"
                        />
                      ))}
                      {facetData.values.length > 10 && (
                        <small className="text-muted">+ {facetData.values.length - 10} more</small>
                      )}
                    </div>
                  ))
                }
                
                {/* Show message if no filters available */}
                {Object.keys(facets).length === 0 && !loading && (
                  <div className="text-muted text-center py-3">
                    <small>No filters available</small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Results Grid */}
            {/* Results Grid */}
            <Col lg={9}>
              {loading ? (
                <Card>
                  <Card.Body className="text-center py-5">
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <p className="text-muted">Loading results...</p>
                  </Card.Body>
                </Card>
              ) : error ? (
                <Alert variant="danger">
                  <strong>Error:</strong> {error}
                </Alert>
              ) : results.length > 0 ? (
                <Row>
                  {results.map((part) => {
                    // --- LOGIC FOR FILTERING SPECS ---
                    const specs = part.part_specs || {};

                    // Explicitly pull these fields for display
                    const manufacturer = part.manufacturer || 'Unknown';
                    const packaging = part.packaging || '';
                    const type = part.type || '';

                    // Get category types that ARE NOT currently active filters
                    // AND are not already handled explicitly (manufacturer, packaging, type)
                    // AND are not pricing/stock related
                    const activeFilterKeys = Object.keys(selectedFilters);
                    const dynamicSpecs = Object.entries(specs).filter(([key, value]) => {
                      const cleanKey = key.replace('.value', '');
                      const isFilter = activeFilterKeys.includes(cleanKey);
                      const isExplicitField = ['manufacturer', 'packaging', 'type'].includes(cleanKey);
                      const isRemovedField = ['price', 'stock_status', 'stock', 'inventory'].includes(cleanKey);
                      return value && !isFilter && !isExplicitField && !isRemovedField && key.endsWith('.value');
                  });

                    return (
                      <Col key={part.id} xs={12} sm={6} md={4} className="mb-4">
                        <Card className="product-card h-100">
                          <Link to={`/part/${part.part_number || part.partNumber}`} className="text-decoration-none text-dark">
                            <div className="product-image-container">
                              {/* Use placeholder image if not available */}
                              {/*
                              <img
                                src={part.image || 'https://via.placeholder.com/200x150?text=No+Image'}
                                alt={part.part_number || part.partNumber}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=No+Image' }}
                              />
                              */}
                              {/* Pricing/Stock badges removed */}
                            </div>
                            <Card.Body>
                              <h6 className="text-primary-tint mb-1">{part.part_number || part.partNumber}</h6>

                              {/* 1. Manufacturer */}
                              <div className="small mb-0">
                                <strong>Manufacturer:</strong> {manufacturer}
                              </div>

                              {/* 2. Packaging */}
                              {packaging && (
                                <div className="small mb-0">
                                  <strong>Packaging:</strong> {packaging}
                                </div>
                              )}

                              {/* 3. Type */}
                              {type && (
                                <div className="small mb-0">
                                  <strong>Type:</strong> {type}
                                </div>
                              )}

                              {/* 4. Other category details (only if not a filter) */}
                              {dynamicSpecs.length > 0 && (
                                <div className="mt-2 pt-2 border-top">
                                  {dynamicSpecs.map(([key, value]) => (
                                    <div key={key} className="small text-muted mb-1">
                                      <strong>{formatFilterLabel(key.replace('.value', ''))}:</strong> {value}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Pricing and Stock footer removed */}
                            </Card.Body>
                          </Link>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <Card>
                  <Card.Body className="text-center py-5">
                    <h5>No results found</h5>
                    <p className="text-muted">Try adjusting your search or filters</p>
                    {(Object.keys(selectedFilters).length > 0 || Object.keys(pendingFilters).length > 0) && (
                      <Button variant="primary" onClick={clearFilters}>Clear All Filters</Button>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Col>
        </Row>
      </Container>
    </>
  );
};

export default SearchResults;