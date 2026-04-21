import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMicrochip, faMemory, faPlug, faSatelliteDish, 
  faBatteryFull, faWifi, faLightbulb, faTools,
  faShippingFast, faShieldAlt, faAward, faHeadset,
  faGears, faIndustry, faChevronDown, faChevronUp // Added carets
} from '@fortawesome/free-solid-svg-icons';
import SearchBar from './SearchBar';
import SEO from './SEO';
import { fetchCategories, getCategoryIcon, fetchManufacturers } from '../services/api';
import ComponentSearchLandingSlides from './ComponentSearchLandingSlides';

const iconMap = {
  faMicrochip, faMemory, faPlug, faSatelliteDish,
  faBatteryFull, faWifi, faLightbulb, faTools,
  faGears, faShieldAlt
};

const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false); // State for Categories

  const [manufacturers, setManufacturers] = useState([]);
  const [loadingManufacturers, setLoadingManufacturers] = useState(true);
  const [manufacturersError, setManufacturersError] = useState(null);
  const [showAllManufacturers, setShowAllManufacturers] = useState(false); // State for Manufacturers

  const ITEMS_PER_ROW = 4;
  const INITIAL_ROWS = 2;
  const LIMIT = ITEMS_PER_ROW * INITIAL_ROWS;

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

  // Helper to determine what to display
  const visibleCategories = showAllCategories ? categories : categories.slice(0, LIMIT);
  const visibleManufacturers = showAllManufacturers ? manufacturers : manufacturers.slice(0, LIMIT);

  return (
    <>
      <SEO
        title="Electronic Components & Parts Search"
        description="Find millions of electronic components from trusted suppliers."
        keywords="electronic components, semiconductors, IC chips, passive components, connectors"
      />

      {/* Hero Section */}
      <section className="hero-section text-center py-5 bg-light">
        <Container>
          <h1 className="display-4 fw-bold mb-3">Find Electronic Components Instantly</h1>
          <p className="lead mb-4">Search from millions of parts in stock and available</p>
          <SearchBar />
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-4">Browse by Category</h2>

          {loadingCategories && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          )}

          {!loadingCategories && !categoriesError && (
            <>
              <Row>
                {visibleCategories.map((category, index) => (
                  <Col key={index} xs={6} md={4} lg={3} className="mb-4">
                    <Link to={`/category/${encodeURIComponent(category.category)}`} className="category-card text-decoration-none">
                      <div className="icon mb-2">
                        <FontAwesomeIcon icon={iconMap[getCategoryIcon(category.category)]} />
                      </div>
                      <h6 className="mb-1">{category.category}</h6>
                      <small className="text-muted">{category.count.toLocaleString()} Parts</small>
                    </Link>
                  </Col>
                ))}
              </Row>

              {categories.length > LIMIT && (
                <div className="text-center mt-2">
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                  >
                    {showAllCategories ? 'See Less ' : 'See More '}
                    <FontAwesomeIcon icon={showAllCategories ? faChevronUp : faChevronDown} className="ms-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </Container>
      </section>

      {/* Manufacturers Section */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-4">Browse by Manufacturer</h2>

          {loadingManufacturers && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          )}

          {!loadingManufacturers && !manufacturersError && (
            <>
              <Row>
                {visibleManufacturers.map((mfr, index) => (
                  <Col key={index} xs={6} md={4} lg={3} className="mb-4">
                    <Link to={`/search?manufacturer=${encodeURIComponent(mfr.manufacturer)}`} className="category-card text-decoration-none">
                      <div className="icon mb-2">
                        <FontAwesomeIcon icon={faIndustry} />
                      </div>
                      <h6 className="mb-1">{mfr.manufacturer}</h6>
                      <small className="text-muted">{mfr.count.toLocaleString()} Parts</small>
                    </Link>
                  </Col>
                ))}
              </Row>

              {manufacturers.length > LIMIT && (
                <div className="text-center mt-2">
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowAllManufacturers(!showAllManufacturers)}
                  >
                    {showAllManufacturers ? 'See Less ' : 'See More '}
                    <FontAwesomeIcon icon={showAllManufacturers ? faChevronUp : faChevronDown} className="ms-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  );
};

export default LandingPage;