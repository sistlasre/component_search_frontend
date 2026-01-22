import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMicrochip, faMemory, faPlug, faSatelliteDish, 
  faBatteryFull, faWifi, faLightbulb, faTools,
  faShippingFast, faShieldAlt, faAward, faHeadset,
  faGears
} from '@fortawesome/free-solid-svg-icons';
import SearchBar from './SearchBar';
import SEO from './SEO';
import { featuredParts, featuredManufacturers } from '../data/mockData';
import { fetchCategories, getCategoryIcon } from '../services/api';

const iconMap = {
  faMicrochip, faMemory, faPlug, faSatelliteDish,
  faBatteryFull, faWifi, faLightbulb, faTools,
  faGears, faShieldAlt
};

const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
        setCategoriesError(null);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategoriesError('Failed to load categories. Please try again later.');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);
  return (
    <>
      <SEO 
        title="Electronic Components & Parts Search"
        description="Find millions of electronic components from trusted suppliers. Real-time inventory, competitive pricing, and fast shipping."
        keywords="electronic components, semiconductors, IC chips, passive components, connectors"
      />
      
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={12} className="text-center">
              <h1 className="display-4 fw-bold mb-3">
                Find Electronic Components Instantly
              </h1>
              <p className="lead mb-4">
                Search millions of parts from authorized distributors worldwide
              </p>
              <SearchBar />
              <div className="mt-4">
                <small className="opacity-75">
                  Popular searches: STM32, ESP32, Arduino, Raspberry Pi, LM358
                </small>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Trust Indicators */}
      <section className="bg-light py-3">
        <Container>
          <Row className="text-center">
            <Col xs={6} md={3} className="mb-2 mb-md-0">
              <div className="d-flex align-items-center justify-content-center">
                <FontAwesomeIcon icon={faShippingFast} className="text-primary-tint me-2" />
                <small className="fw-semibold">Fast Shipping</small>
              </div>
            </Col>
            <Col xs={6} md={3} className="mb-2 mb-md-0">
              <div className="d-flex align-items-center justify-content-center">
                <FontAwesomeIcon icon={faShieldAlt} className="text-primary-tint me-2" />
                <small className="fw-semibold">100% Authentic</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="d-flex align-items-center justify-content-center">
                <FontAwesomeIcon icon={faAward} className="text-primary-tint me-2" />
                <small className="fw-semibold">ISO Certified</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="d-flex align-items-center justify-content-center">
                <FontAwesomeIcon icon={faHeadset} className="text-primary-tint me-2" />
                <small className="fw-semibold">24/7 Support</small>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-4">Browse by Category</h2>
          
          {/* Loading State */}
          {loadingCategories && (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading categories...</span>
              </Spinner>
              <p className="mt-3 text-muted">Loading categories...</p>
            </div>
          )}
          
          {/* Error State */}
          {categoriesError && !loadingCategories && (
            <Alert variant="danger" className="text-center">
              <h5>Error Loading Categories</h5>
              <p>{categoriesError}</p>
              <Button 
                variant="outline-danger" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </Alert>
          )}
          
          {/* Categories Grid */}
          {!loadingCategories && !categoriesError && (
            <Row>
              {categories.map((category, index) => (
                <Col key={index} xs={6} md={4} lg={3} className="mb-4">
                  <Link to={`/category/${encodeURIComponent(category.category)}`} className="category-card">
                    <div className="icon">
                      <FontAwesomeIcon icon={iconMap[getCategoryIcon(category.category)]} />
                    </div>
                    <h6 className="mb-1">{category.category}</h6>
                    <small className="text-muted">{category.count.toLocaleString()} Parts</small>
                  </Link>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* Featured Products */}
      <section className="py-5 bg-light">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Featured Products</h2>
            <Link to="/search" className="btn btn-outline-primary">View All</Link>
          </div>
          <Row>
            {featuredParts.slice(0, 8).map((part) => (
              <Col key={part.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
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
        </Container>
      </section>

      {/* Manufacturers Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-4">Trusted Manufacturers</h2>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                {featuredManufacturers.map((manufacturer, index) => (
                  <Button
                    key={index}
                    variant="outline-secondary"
                    size="sm"
                    as={Link}
                    to={`/search?manufacturer=${encodeURIComponent(manufacturer)}`}
                    className="mb-2"
                  >
                    {manufacturer}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-tint text-white py-5">
        <Container>
          <Row className="text-center">
            <Col>
              <h3 className="mb-3">Need Help Finding Parts?</h3>
              <p className="mb-4">Our experts are ready to help you source hard-to-find components</p>
              <Button variant="light" size="lg">Request a Quote</Button>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default LandingPage;