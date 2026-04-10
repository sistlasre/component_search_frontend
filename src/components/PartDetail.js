import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Breadcrumb, Alert, Form, Button, InputGroup } from 'react-bootstrap';
import SEO from './SEO';
import { fetchPartDetails } from '../services/api';
import { transformPartData } from '../utils/dataTransformers';
import { useCart } from '../context/CartContext';

const PartDetail = () => {
  const { partNumber } = useParams();
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!part) return;
    addToCart({ partNumber: part.partNumber, manufacturer: part.manufacturer, quantity });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  useEffect(() => {
    const loadPartDetails = async () => {
      setLoading(true);
      try {
        const apiData = await fetchPartDetails(partNumber);
        const transformedData = transformPartData(apiData);
        setPart(transformedData);
      } catch (error) {
        console.error('Error fetching part details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPartDetails();
  }, [partNumber]);

  if (loading) return <Container className="py-5 text-center"><div className="spinner-border text-primary" /></Container>;
  if (!part) return <Container className="py-5"><Alert variant="warning">Part Not Found</Alert></Container>;

  const formatQuantity = (qty) => Number(qty).toLocaleString();

  return (
    <>
      <SEO title={`${part.partNumber} - ${part.manufacturer}`} description={part.description} />

      <Container className="py-4">
        <Breadcrumb className="small mb-2">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/search" }}>Search</Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/search?category=${part.category}` }}>{part.category}</Breadcrumb.Item>
          {part.subcategory && (
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/search?category=${part.category}&subcategory=${part.subcategory}` }}>
              {part.subcategory}
            </Breadcrumb.Item>
          )}
          {part.rawData?.category3 && (
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/search?category=${part.category}&subcategory=${part.subcategory}&category3=${part.rawData.category3}` }}>
              {part.rawData.category3}
            </Breadcrumb.Item>
          )}
          {part.rawData?.category4 && (
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/search?category=${part.category}&subcategory=${part.subcategory}&category3=${part.rawData.category3}&category4=${part.rawData.category4}` }}>
              {part.rawData.category4}
            </Breadcrumb.Item>
          )}
          {part.rawData?.category5 && (
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/search?category=${part.category}&subcategory=${part.subcategory}&category3=${part.rawData.category3}&category4=${part.rawData.category4}&category5=${part.rawData.category5}` }}>
              {part.rawData.category5}
            </Breadcrumb.Item>
          )}
          <Breadcrumb.Item active>{part.partNumber}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Part Number Heading */}
        <h1 className="h2 mb-4" style={{ fontWeight: 400 }}>{part.partNumber}</h1>

        <Row>
          {/* Left Column: Image (Top) and Part Header Info (Below) */}
          <Col lg={8} className="d-flex flex-column ps-5">
            <div className="part-image-gallery">
                <img
                  src={part.image}
                  alt={part.partNumber}
                  style={{ maxWidth: '100%', maxHeight: '250px' }}
                />
              </div>

            <div className="part-header-info">
              <h2 className="h4 mb-1" style={{ fontWeight: 500 }}>{part.manufacturer}</h2>
              <p className="text-muted mb-3">{part.description}</p>

              <Table borderless size="sm" className="mb-4" style={{ maxWidth: '500px' }}>
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
                </tbody>
              </Table>
            </div>
          </Col>

          {/* Right Column: Pricing Card (Design from first output) */}
          <Col lg={4}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <div className="mb-3">
                  <span className="h4 text-success fw-bold">{formatQuantity(part.totalQuantity)}</span>
                  <span className="text-muted ms-2">available</span>
                </div>

                <Table bordered hover size="sm" className="small mb-4">
                  <thead className="bg-light">
                    <tr>
                      <th className="text-primary py-2">QTY.</th>
                      <th className="text-primary py-2">UNIT PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {part.priceBreaks?.map((pb) => (
                      <tr key={pb.break_qty}>
                        <td className="py-2">{formatQuantity(pb.break_qty)}+</td>
                        <td className="py-2">${pb.price.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* Integrated Shopping Cart Section */}
                <div className="bg-light p-3 rounded border">
                  <Form.Group className="mb-3">
                    <InputGroup>
                      <InputGroup.Text className="bg-white text-muted small fw-bold">QTY</InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                    </InputGroup>
                  </Form.Group>
                  <Button variant="primary" className="w-100 fw-bold py-2 shadow-sm" onClick={handleAddToCart}>
                    Add to Cart
                  </Button>
                  {addedToCart && (
                    <Alert variant="success" className="mt-2 mb-0 py-2 text-center small">
                      Added to cart!
                    </Alert>
                  )}
                </div>

                <div className="mt-4 text-center opacity-50">
                   <div className="d-flex justify-content-center gap-3">
                     <i className="fab fa-cc-visa fa-2x"></i>
                     <i className="fab fa-cc-amex fa-2x"></i>
                     <i className="fab fa-cc-discover fa-2x"></i>
                     <i className="fab fa-cc-mastercard fa-2x"></i>
                   </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Bottom Section: Specifications (Full Width) */}
        <Row className="mt-5">
          <Col xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-bold">Product Specifications</h5>
              </Card.Header>
              <Card.Body>
                {Object.entries(part.specifications).map(([section, specs]) => (
                  <div key={section} className="mb-4">
                    <h6 className="text-uppercase small fw-bold text-muted border-bottom pb-2 mb-3">{section}</h6>
                    <Table bordered hover size="sm">
                      <tbody>
                        {Object.entries(specs).map(([key, value]) => (
                          <tr key={key}>
                            <td className="bg-light fw-bold text-muted" style={{ width: '30%' }}>{key}</td>
                            <td>{Array.isArray(value) ? value.join(', ') : value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PartDetail;