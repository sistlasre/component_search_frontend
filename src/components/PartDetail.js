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

        <Row>
          {/* Left Column: Image and Header Info side-by-side */}
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                {/* Part Number Heading */}
                <h1 className="h2 mb-3 pb-3 border-bottom" style={{ fontWeight: 400, textAlign: 'center' }}>{part.partNumber}</h1>
                <Row>
                  {/* Image Section */}
                  <Col md={5} className="mb-4 mb-md-0 border-end-md">
                    <div className="border p-3 rounded bg-white text-center d-flex align-items-center justify-content-center" style={{ minHeight: '250px' }}>
                      <div className="image-overlay-wrapper">
                          <img
                            src="/generic-part.png"
                            alt={part.partNumber}
                            className="part-image"
                          />
                          <div className="overlay-badge">
                            {part.partNumber}
                          </div>
                      </div>
                    </div>
                  </Col>

                  {/* Info Section */}
                  <Col md={7}>
                    <div className="ps-md-3">
                      <h2 className="h4 mb-1" style={{ fontWeight: 500 }}>{part.manufacturer}</h2>
                      <p className="text-muted pb-3 mb-3 border-bottom">{part.description}</p>

                      <Table bordered size="sm" className="mb-0">
                        <tbody>
                          <tr>
                            <td className="fw-bold py-1 bg-light" style={{ width: '120px' }}>Manufacturer</td>
                            <td className="py-1"><Link to={`/search?manufacturer=${part.manufacturer}`} className="text-decoration-none">{part.manufacturer}</Link></td>
                          </tr>
                          <tr>
                            <td className="fw-bold py-1 bg-light">Part #</td>
                            <td className="py-1">{part.partNumber}</td>
                          </tr>
                          <tr>
                            <td className="fw-bold py-1 bg-light">Category</td>
                            <td className="py-1"><Link to={`/search?category=${part.category}`} className="text-decoration-none">{part.category}</Link></td>
                          </tr>
                          {part.subcategory && (
                            <tr>
                              <td className="fw-bold py-1 bg-light">Subcategory</td>
                              <td className="py-1">
                                <Link to={`/search?category=${part.category}&subcategory=${part.subcategory}`} className="text-decoration-none">
                                  {part.subcategory}
                                </Link>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column: Pricing Card */}
          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Body className="p-0">
                <div className="px-3 py-2 border-bottom">
                  <span className="h3 text-success fw-bold mb-0">{formatQuantity(part.totalQuantity)}</span>
                  <span className="text-muted ms-2">available</span>
                </div>

                <div className="bg-light px-3 py-2 border-top border-bottom">
                  <Form.Group className="mb-2">
                    <InputGroup size="md">
                      <InputGroup.Text className="bg-white text-muted small fw-bold">QTY</InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                    </InputGroup>
                  </Form.Group>
                  <Button variant="primary" size="md" className="w-100 fw-bold shadow-sm" onClick={handleAddToCart}>
                    Add to Cart
                  </Button>
                  {addedToCart && (
                    <Alert variant="success" className="mt-2 mb-0 py-1 text-center small border-0">
                      Added to cart!
                    </Alert>
                  )}
                </div>

                <Table bordered hover size="sm" className="small mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="text-primary py-1 px-2">QTY.</th>
                      <th className="text-primary py-1 px-2">UNIT PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {part.priceBreaks?.filter((pb) => pb.price > 0).map((pb) => (
                      <tr key={pb.break_qty}>
                        <td className="py-1 px-2">{formatQuantity(pb.break_qty)}+</td>
                        <td className="py-1 px-2">${pb.price.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>



                <div className="px-3 py-2 text-center opacity-50">
                   <div className="d-flex justify-content-center gap-3">
                     <i className="fab fa-cc-visa fa-lg"></i>
                     <i className="fab fa-cc-amex fa-lg"></i>
                     <i className="fab fa-cc-discover fa-lg"></i>
                     <i className="fab fa-cc-mastercard fa-lg"></i>
                   </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Bottom Section: Specifications (Full Width) */}
        <Row className="mt-0">
          <Col xs={8}>
            <Card className="shadow-sm">
              <Card.Header className="bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-bold">Product Specifications</h5>
              </Card.Header>
              <Card.Body>
                {Object.entries(part.specifications).map(([section, specs], idx, arr) => (
                  <div key={section} className={`mb-4 pb-4 ${idx < arr.length - 1 ? 'border-bottom' : ''}`}>
                    <h6 className="text-uppercase small fw-bold text-muted border-bottom pb-2 mb-3">{section}</h6>
                    <Table bordered hover size="sm" className="mb-0">
                      <tbody>
                        {Object.entries(specs).map(([key, value]) => (
                          <tr key={key}>
                            <td className="bg-light fw-bold text-muted border-end" style={{ width: '30%' }}>{key}</td>
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