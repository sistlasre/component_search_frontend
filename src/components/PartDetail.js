import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Breadcrumb, Alert } from 'react-bootstrap';
import SEO from './SEO';
import { getPartDetails } from '../data/mockData';
import { fetchPartDetails } from '../services/api';
import { transformPartData } from '../utils/dataTransformers';

const PartDetail = () => {
  const { partNumber } = useParams();
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPartDetails = async () => {
      setLoading(true);
      try {
        // Try to fetch from real API first
        const apiData = await fetchPartDetails(partNumber);
        const transformedData = transformPartData(apiData);

        setPart(transformedData);
      } catch (error) {
        console.error('Error fetching part from API, falling back to mock data:', error);
        // Fallback to mock data if API fails
        const details = getPartDetails(partNumber);
        setPart(details);
      } finally {
        setLoading(false);
      }
    };

    loadPartDetails();
  }, [partNumber]);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!part) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <h4>Part Not Found</h4>
          <p>The part number "{partNumber}" could not be found in our database.</p>
          <Link to="/" className="btn btn-primary">Back to Search</Link>
        </Alert>
      </Container>
    );
  }

  const formatQuantity = (qty) => {
    return Number.isInteger(qty) ? qty.toLocaleString() : qty.toLocaleString();
  };

  return (
    <>
      <SEO 
        title={`${part.partNumber} - ${part.manufacturer}`}
        description={part.description}
        keywords={`${part.partNumber}, ${part.manufacturer}, ${part.category}, electronic component`}
        type="product"
        author={part.manufacturer}
      />

      <Container className="py-4">
        {/* Breadcrumb */}
        <Breadcrumb>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/search" }}>Search</Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/search?category=${part.category}` }}>
            {part.category}
          </Breadcrumb.Item>
          {part.subcategory && (
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/search?category=${part.category}&subcategory=${part.subcategory}` }}>
              {part.subcategory}
            </Breadcrumb.Item>
          )}
          <Breadcrumb.Item active>{part.partNumber}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Part Header */}
        <div className="part-detail-header mb-4">
          <Row>
            <Col md={4}>
              <div className="part-image-gallery">
                <img
                  src={part.image}
                  alt={part.partNumber}
                  style={{ maxWidth: '100%', maxHeight: '250px' }}
                />
              </div>
            </Col>
            <Col md={8}>
              <h1 className="h2 mb-1">
                <span className="text-muted" style={{ fontWeight: 400 }}>{part.manufacturer}</span>{' '}
                {part.partNumber}
              </h1>
              <p className="lead mb-3">{part.description}</p>
              <Table borderless size="sm" className="part-info-table mb-0">
                <tbody>
                  <tr>
                    <td className="part-info-label">Manufacturer</td>
                    <td><Link to={`/search?manufacturer=${part.manufacturer}`}>{part.manufacturer}</Link></td>
                  </tr>
                  <tr>
                    <td className="part-info-label">Part #</td>
                    <td>{part.partNumber}</td>
                  </tr>
                  <tr>
                    <td className="part-info-label">Category</td>
                    <td><Link to={`/search?category=${part.category}`}>{part.category}</Link></td>
                  </tr>
                  {part.subcategory && (
                    <tr>
                      <td className="part-info-label">Subcategory</td>
                      <td>
                        <Link to={`/search?category=${part.category}&subcategory=${part.subcategory}`}>
                          {part.subcategory}
                        </Link>
                      </td>
                    </tr>
                  )}
                  {part.rawData?.product_status && (
                    <tr>
                      <td className="part-info-label">Status</td>
                      <td>
                        <Badge bg={part.rawData.product_status === 'Active' ? 'success' : 'secondary'}>
                          {part.rawData.product_status}
                        </Badge>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
          </Row>
        </div>

        {/* Two-column layout: Specs + Pricing */}
        <Row>
          {/* Left column: Specifications */}
          <Col lg={8}>
            <Card className="specifications-table mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Product Specifications</h5>
              </Card.Header>
              <Card.Body>
                {Object.entries(part.specifications).map(([section, specs]) => (
                  <div key={section} className="mb-4">
                    <h6 className="spec-section-title mb-3">{section}</h6>
                    <Table bordered size="sm" className="spec-table mb-0">
                      <tbody>
                        {Object.entries(specs).map(([key, value]) => (
                          <tr key={key}>
                            <td className="spec-key">
                              {key}
                            </td>
                            <td className="spec-value">{Array.isArray(value) ? value.join(', ') : value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>

          {/* Right column: Pricing & Availability */}
          <Col lg={4}>
            <div className="pricing-panel">
              <Card className="pricing-card mb-4">
                <Card.Body>
                  {/* Stock status */}
                  <div className="stock-status mb-3">
                    {part.pricingType && (
                      <Badge
                        bg={part.pricingType === 'In Stock' ? 'success' : 'info'}
                        className="stock-badge-label mb-2"
                      >
                        {part.pricingType}
                      </Badge>
                    )}
                    {part.totalQuantity > 0 && (
                      <div className="stock-quantity">
                        <span className="stock-number">{formatQuantity(part.totalQuantity)}</span>
                        <span className="text-muted"> available</span>
                      </div>
                    )}
                  </div>

                  {/* Price breaks table */}
                  {part.priceBreaks && part.priceBreaks.length > 0 && (
                    <Table bordered size="sm" className="price-breaks-table mb-0 mt-3">
                      <thead>
                        <tr>
                          <th>Qty.</th>
                          <th>Unit Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {part.priceBreaks.map((pb) => (
                          <tr key={pb.break_qty}>
                            <td className="price-break-qty">{formatQuantity(pb.break_qty)}+</td>
                            <td className="price-break-price">${pb.price.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}

                  {(!part.priceBreaks || part.priceBreaks.length === 0) && !part.pricingType && (
                    <p className="text-muted mb-0">Pricing information not available.</p>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PartDetail;
