import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button, Breadcrumb } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMicrochip, faMemory, faPlug, faSatelliteDish, 
  faBatteryFull, faWifi, faLightbulb, faTools,
  faGears, faShieldAlt, faArrowLeft,
  faSearch, faFolder
} from '@fortawesome/free-solid-svg-icons';
import SEO from './SEO';
import SearchBar from './SearchBar';
import { fetchSubcategories, getCategoryIcon } from '../services/api';

const iconMap = {
  faMicrochip, faMemory, faPlug, faSatelliteDish,
  faBatteryFull, faWifi, faLightbulb, faTools,
  faGears, faShieldAlt
};

const SubcategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Decode the category name from URL
  const decodedCategoryName = decodeURIComponent(categoryName);

  useEffect(() => {
    const loadSubcategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchSubcategories(decodedCategoryName);
        setSubcategories(data);
      } catch (err) {
        setError('Failed to load subcategories. Please try again later.');
        console.error('Error loading subcategories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSubcategories();
  }, [decodedCategoryName]);

  const handleSubcategoryClick = (subcategory) => {
    // Navigate to search results with both category and subcategory filters
    const params = new URLSearchParams({
      category: decodedCategoryName,
      subcategory: subcategory
    });
    navigate(`/search?${params.toString()}`);
  };

  const handleViewAllClick = () => {
    // Navigate to search results with just the category filter
    navigate(`/search?category=${encodeURIComponent(decodedCategoryName)}`);
  };

  // Get the appropriate icon for the category
  const categoryIcon = getCategoryIcon(decodedCategoryName);

  return (
    <>
      <SEO 
        title={`${decodedCategoryName} - Browse Subcategories`}
        description={`Browse subcategories in ${decodedCategoryName}. Find electronic components and parts.`}
        keywords={`${decodedCategoryName}, electronic components, subcategories`}
      />
      
      <Container className="py-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
            Home
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{decodedCategoryName}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Search Bar */}
        <div className="mb-5">
          <SearchBar />
        </div>

        {/* Category Header */}
        <div className="text-center mb-5">
          <div className="d-flex align-items-center justify-content-center mb-3">
            <FontAwesomeIcon 
              icon={iconMap[categoryIcon]} 
              size="3x" 
              className="text-primary me-3"
            />
            <h1 className="display-5 mb-0">{decodedCategoryName}</h1>
          </div>
          <p className="lead text-muted">
            Browse by Subcategory
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading subcategories...</span>
            </Spinner>
            <p className="mt-3 text-muted">Loading subcategories...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert variant="danger" className="text-center">
            <h5>Error Loading Subcategories</h5>
            <p>{error}</p>
            <Button 
              variant="outline-danger" 
              onClick={() => window.location.reload()}
              className="me-2"
            >
              Try Again
            </Button>
            <Button 
              variant="outline-secondary" 
              as={Link} 
              to="/"
            >
              Back to Home
            </Button>
          </Alert>
        )}

        {/* Subcategories Grid */}
        {!loading && !error && subcategories.length > 0 && (
          <>
            {/* View All Button */}
            <div className="text-center mb-4">
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleViewAllClick}
                className="mb-4"
              >
                <FontAwesomeIcon icon={faSearch} className="me-2" />
                View All {decodedCategoryName} Products
              </Button>
            </div>

            <Row>
              {subcategories.map((subcategory, index) => (
                <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <Card 
                    className="subcategory-card h-100 shadow-sm"
                    onClick={() => handleSubcategoryClick(subcategory.subcategory)}
                    style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <Card.Body className="text-center">
                      <div className="mb-3">
                        <FontAwesomeIcon 
                          icon={faFolder} 
                          size="2x" 
                          className="text-primary-tint"
                        />
                      </div>
                      <h5 className="card-title mb-2">
                        {subcategory.subcategory}
                      </h5>
                      <Badge bg="secondary" className="px-3 py-2">
                        {subcategory.count.toLocaleString()} Parts
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && subcategories.length === 0 && (
          <Alert variant="info" className="text-center">
            <h5>No Subcategories Found</h5>
            <p>No subcategories are available for {decodedCategoryName}.</p>
            <Button 
              variant="primary" 
              onClick={handleViewAllClick}
            >
              Browse All {decodedCategoryName} Products
            </Button>
          </Alert>
        )}

        {/* Back to Categories */}
        <div className="text-center mt-5">
          <Button 
            variant="outline-secondary" 
            as={Link} 
            to="/"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to All Categories
          </Button>
        </div>
      </Container>
    </>
  );
};

export default SubcategoryPage;