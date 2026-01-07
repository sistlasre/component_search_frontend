import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSort } from '@fortawesome/free-solid-svg-icons';
import SEO from './SEO';
import SearchBar from './SearchBar';
import { searchParts, categories, featuredManufacturers } from '../data/mockData';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';
  const manufacturerFilter = searchParams.get('manufacturer') || '';
  
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);

  useEffect(() => {
    // Get search results
    let searchResults = searchParts(query);
    
    // Apply category filter from URL
    if (categoryFilter) {
      searchResults = searchResults.filter(p => p.category === categoryFilter);
      setSelectedCategories([categoryFilter]);
    }
    
    // Apply manufacturer filter from URL
    if (manufacturerFilter) {
      searchResults = searchResults.filter(p => p.manufacturer === manufacturerFilter);
      setSelectedManufacturers([manufacturerFilter]);
    }
    
    setResults(searchResults);
    setFilteredResults(searchResults);
  }, [query, categoryFilter, manufacturerFilter]);

  useEffect(() => {
    let filtered = [...results];

    // Apply category filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Apply manufacturer filters
    if (selectedManufacturers.length > 0) {
      filtered = filtered.filter(p => selectedManufacturers.includes(p.manufacturer));
    }

    // Apply price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(p => {
        const price = parseFloat(p.price.replace('$', ''));
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', '')));
        break;
      case 'stock':
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      default:
        // Keep original order (relevance)
        break;
    }

    setFilteredResults(filtered);
  }, [results, sortBy, priceRange, selectedCategories, selectedManufacturers]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleManufacturerToggle = (manufacturer) => {
    setSelectedManufacturers(prev =>
      prev.includes(manufacturer)
        ? prev.filter(m => m !== manufacturer)
        : [...prev, manufacturer]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedManufacturers([]);
    setPriceRange({ min: '', max: '' });
    setSortBy('relevance');
  };

  return (
    <>
      <SEO 
        title={`Search Results${query ? ` for "${query}"` : ''}`}
        description={`Find electronic components and parts. ${filteredResults.length} results found.`}
        keywords="electronic components search, parts finder, component database"
      />

      <Container className="py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar />
        </div>

        {/* Results Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            {query && `Search results for "${query}"`}
            {categoryFilter && !query && `${categoryFilter}`}
            {manufacturerFilter && !query && `Parts by ${manufacturerFilter}`}
            <span className="text-muted ms-2">({filteredResults.length} results)</span>
          </h5>
          <Form.Select 
            style={{ width: 'auto' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="relevance">Sort by: Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="stock">Stock Availability</option>
          </Form.Select>
        </div>

        <Row>
          {/* Filters Sidebar */}
          <Col lg={3} className="mb-4">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>
                  <FontAwesomeIcon icon={faFilter} className="me-2" />
                  Filters
                </span>
                <Button variant="link" size="sm" onClick={clearFilters} className="p-0">
                  Clear All
                </Button>
              </Card.Header>
              <Card.Body>
                {/* Price Range */}
                <div className="mb-4">
                  <h6 className="mb-2">Price Range</h6>
                  <Row className="g-2">
                    <Col xs={6}>
                      <Form.Control
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        size="sm"
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        size="sm"
                      />
                    </Col>
                  </Row>
                </div>

                {/* Categories */}
                <div className="mb-4">
                  <h6 className="mb-2">Categories</h6>
                  {categories.slice(0, 5).map(cat => (
                    <Form.Check
                      key={cat.id}
                      type="checkbox"
                      label={cat.name}
                      checked={selectedCategories.includes(cat.name)}
                      onChange={() => handleCategoryToggle(cat.name)}
                      className="mb-1"
                    />
                  ))}
                </div>

                {/* Manufacturers */}
                <div className="mb-4">
                  <h6 className="mb-2">Manufacturers</h6>
                  {featuredManufacturers.slice(0, 5).map(mfr => (
                    <Form.Check
                      key={mfr}
                      type="checkbox"
                      label={mfr}
                      checked={selectedManufacturers.includes(mfr)}
                      onChange={() => handleManufacturerToggle(mfr)}
                      className="mb-1"
                    />
                  ))}
                </div>

                {/* Stock Status */}
                <div className="mb-4">
                  <h6 className="mb-2">Availability</h6>
                  <Form.Check type="checkbox" label="In Stock" defaultChecked className="mb-1" />
                  <Form.Check type="checkbox" label="Ships Today" className="mb-1" />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Results Grid */}
          <Col lg={9}>
            {filteredResults.length > 0 ? (
              <Row>
                {filteredResults.map((part) => (
                  <Col key={part.id} xs={12} sm={6} md={4} className="mb-4">
                    <Card className="product-card h-100">
                      <Link to={`/part/${part.partNumber}`} className="text-decoration-none text-dark">
                        <div className="product-image-container">
                          <img src={part.image} alt={part.partNumber} />
                          {part.stock > 0 && (
                            <Badge bg="success" className="stock-badge">
                              In Stock
                            </Badge>
                          )}
                        </div>
                        <Card.Body>
                          <h6 className="text-primary-tint mb-1">{part.partNumber}</h6>
                          <small className="text-muted d-block mb-2">{part.manufacturer}</small>
                          <p className="small text-truncate-2 mb-2">{part.description}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="h5 mb-0 text-accent">{part.price}</span>
                            <small className="text-muted">{part.stock.toLocaleString()} units</small>
                          </div>
                        </Card.Body>
                      </Link>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card>
                <Card.Body className="text-center py-5">
                  <h5>No results found</h5>
                  <p className="text-muted">Try adjusting your search or filters</p>
                  <Button variant="primary" onClick={clearFilters}>Clear All Filters</Button>
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