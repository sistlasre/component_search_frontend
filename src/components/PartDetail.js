import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Badge, Nav, Tab, Breadcrumb, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDownload, faShoppingCart, faCheck, faTruck, faFileAlt, 
  faCube, faClipboardList, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import SEO from './SEO';
import { getPartDetails } from '../data/mockData';

const PartDetail = () => {
  const { partNumber } = useParams();
  const [part, setPart] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const details = getPartDetails(partNumber);
      setPart(details);
      setLoading(false);
    }, 300);
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

  const getCurrentPrice = () => {
    const supplier = part.suppliers[selectedSupplier];
    const priceBreak = supplier.price.find(p => quantity >= p.qty) || supplier.price[0];
    return (priceBreak.price * quantity).toFixed(2);
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
          <Breadcrumb.Item active>{part.partNumber}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Part Header */}
        <div className="part-detail-header mb-4">
          <Row>
            <Col lg={4}>
              <div className="part-image-gallery">
                <img 
                  src={part.image} 
                  alt={part.partNumber}
                  style={{ maxWidth: '100%', maxHeight: '250px' }}
                />
              </div>
            </Col>
            <Col lg={8}>
              <h1 className="h2 mb-1">{part.partNumber}</h1>
              <p className="text-muted mb-3">
                by <Link to={`/search?manufacturer=${part.manufacturer}`}>{part.manufacturer}</Link>
              </p>
              <p className="lead mb-3">{part.description}</p>
              
              <Row className="mb-3">
                <Col xs={6} md={3}>
                  <small className="text-muted d-block">Category</small>
                  <strong>{part.category}</strong>
                </Col>
                <Col xs={6} md={3}>
                  <small className="text-muted d-block">Total Stock</small>
                  <strong className="text-success">
                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                    {part.stock.toLocaleString()} units
                  </strong>
                </Col>
                <Col xs={6} md={3}>
                  <small className="text-muted d-block">Lead Time</small>
                  <strong>{part.leadTime}</strong>
                </Col>
                <Col xs={6} md={3}>
                  <small className="text-muted d-block">RoHS Status</small>
                  <strong className="text-success">Compliant</strong>
                </Col>
              </Row>

              {/* Quick Actions */}
              <div className="d-flex gap-2 flex-wrap">
                <Button variant="primary" size="sm">
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  Datasheet
                </Button>
                <Button variant="outline-primary" size="sm">
                  <FontAwesomeIcon icon={faCube} className="me-2" />
                  3D Model
                </Button>
                <Button variant="outline-primary" size="sm">
                  <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                  Request Sample
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Tabs */}
        <Tab.Container defaultActiveKey="pricing">
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="pricing">Pricing & Availability</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="specifications">Specifications</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="documents">Documents</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="related">Related Products</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* Pricing Tab */}
            <Tab.Pane eventKey="pricing">
              <Card>
                <Card.Body>
                  <h5 className="mb-3">Supplier Pricing & Availability</h5>
                  <div className="table-responsive">
                    <Table className="pricing-table mb-0">
                      <thead>
                        <tr>
                          <th>Supplier</th>
                          <th>Stock</th>
                          <th>MOQ</th>
                          <th>1+</th>
                          <th>10+</th>
                          <th>100+</th>
                          <th>1000+</th>
                          <th>Lead Time</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {part.suppliers.map((supplier, index) => (
                          <tr key={index} className={selectedSupplier === index ? 'table-primary supplier-row' : 'supplier-row'}>
                            <td className="fw-semibold">{supplier.name}</td>
                            <td>
                              <Badge bg={supplier.stock > 1000 ? 'success' : 'warning'}>
                                {supplier.stock.toLocaleString()}
                              </Badge>
                            </td>
                            <td>{supplier.moq}</td>
                            {[1, 10, 100, 1000].map(qty => {
                              const price = supplier.price.find(p => p.qty <= qty);
                              return (
                                <td key={qty}>
                                  {price ? `$${price.price.toFixed(3)}` : '-'}
                                </td>
                              );
                            })}
                            <td>
                              <FontAwesomeIcon icon={faTruck} className="me-1 text-muted" />
                              {supplier.leadTime}
                            </td>
                            <td>
                              <Button 
                                variant={selectedSupplier === index ? 'success' : 'outline-success'}
                                size="sm"
                                onClick={() => setSelectedSupplier(index)}
                              >
                                {selectedSupplier === index ? 'Selected' : 'Select'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Order Section */}
                  <Card className="mt-4 bg-light">
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col md={3}>
                          <label className="form-label">Quantity</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={quantity}
                            min={part.suppliers[selectedSupplier].moq}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          />
                        </Col>
                        <Col md={3}>
                          <label className="form-label">Unit Price</label>
                          <div className="h5 mb-0">
                            ${(getCurrentPrice() / quantity).toFixed(3)}
                          </div>
                        </Col>
                        <Col md={3}>
                          <label className="form-label">Total Price</label>
                          <div className="h4 mb-0 text-primary">
                            ${getCurrentPrice()}
                          </div>
                        </Col>
                        <Col md={3}>
                          <label className="form-label d-none d-md-block">&nbsp;</label>
                          <Button variant="primary" size="lg" className="w-100">
                            <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                            Add to Cart
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Specifications Tab */}
            <Tab.Pane eventKey="specifications">
              <Card className="specifications-table">
                <Card.Body>
                  {Object.entries(part.specifications).map(([section, specs]) => (
                    <div key={section} className="mb-4">
                      <h5 className="mb-3">{section}</h5>
                      <Table striped bordered hover size="sm">
                        <tbody>
                          {Object.entries(specs).map(([key, value]) => (
                            <tr key={key}>
                              <td className="w-40" style={{ width: '40%' }}>
                                <strong>{key}</strong>
                              </td>
                              <td>{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Documents Tab */}
            <Tab.Pane eventKey="documents">
              <Card>
                <Card.Body>
                  <h5 className="mb-3">Available Documents</h5>
                  <Row>
                    {part.documents.map((doc, index) => (
                      <Col key={index} md={6} className="mb-3">
                        <Card className="hover-shadow">
                          <Card.Body className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{doc.type}</h6>
                              <small className="text-muted">{doc.name} • {doc.size}</small>
                            </div>
                            <Button variant="outline-primary" size="sm">
                              <FontAwesomeIcon icon={faDownload} />
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Related Products Tab */}
            <Tab.Pane eventKey="related">
              <Row>
                {part.relatedParts.map((relatedPart) => (
                  <Col key={relatedPart.id} xs={12} sm={6} md={3} className="mb-4">
                    <Card className="product-card h-100">
                      <Link to={`/part/${relatedPart.partNumber}`} className="text-decoration-none text-dark">
                        <div className="product-image-container">
                          <img src={relatedPart.image} alt={relatedPart.partNumber} />
                        </div>
                        <Card.Body>
                          <h6 className="text-primary-tint mb-1">{relatedPart.partNumber}</h6>
                          <small className="text-muted d-block mb-2">{relatedPart.manufacturer}</small>
                          <p className="small text-truncate-2">{relatedPart.description}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="h6 mb-0 text-accent">{relatedPart.price}</span>
                            <Badge bg="success">In Stock</Badge>
                          </div>
                        </Card.Body>
                      </Link>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>
    </>
  );
};

export default PartDetail;