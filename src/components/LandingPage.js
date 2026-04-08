import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMicrochip, faMemory, faPlug, faSatelliteDish, 
  faBatteryFull, faWifi, faLightbulb, faTools,
  faShippingFast, faShieldAlt, faAward, faHeadset,
  faGears, faIndustry
} from '@fortawesome/free-solid-svg-icons';
import SearchBar from './SearchBar';
import SEO from './SEO';
import { fetchCategories, getCategoryIcon, fetchManufacturers } from '../services/api';

const iconMap = {
  faMicrochip, faMemory, faPlug, faSatelliteDish,
  faBatteryFull, faWifi, faLightbulb, faTools,
  faGears, faShieldAlt
};

const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [manufacturers, setManufacturers] = useState([]);
  const [loadingManufacturers, setLoadingManufacturers] = useState(true);
  const [manufacturersError, setManufacturersError] = useState(null);

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
    const loadManufacturers = async () => {
      try {
        const data = await fetchManufacturers();
        setManufacturers(data);
        setManufacturersError(null);
      } catch (error) {
        console.error('Failed to load manufacturers:', error);
        setManufacturersError('Failed to load manufacturers. Please try again later.');
      } finally {
        setLoadingManufacturers(false);
      }
    };

    loadCategories();
    loadManufacturers();
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

      {/* Manufacturers Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-4">Browse by Manufacturer</h2>

          {/* Loading State */}
          {loadingManufacturers && (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading manufacturers...</span>
              </Spinner>
              <p className="mt-3 text-muted">Loading manufacturers...</p>
            </div>
          )}

          {/* Error State */}
          {manufacturersError && !loadingManufacturers && (
            <Alert variant="danger" className="text-center">
              <h5>Error Loading Manufacturers</h5>
              <p>{manufacturersError}</p>
              <Button
                variant="outline-danger"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </Alert>
          )}

          {/* Categories Grid */}
          {!loadingManufacturers && !manufacturersError && (
            <Row>
              {manufacturers.map((mfr, index) => (
                <Col key={index} xs={6} md={4} lg={3} className="mb-4">
                  <Link to={`/search?manufacturer=${encodeURIComponent(mfr.manufacturer)}`} className="category-card">
                    <div className="icon">
                      <FontAwesomeIcon icon={faIndustry} />
                    </div>
                    <h6 className="mb-1">{mfr.manufacturer}</h6>
                    <small className="text-muted">{mfr.count.toLocaleString()} Parts</small>
                  </Link>
                </Col>
              ))}
            </Row>
          )}
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