import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Breadcrumb, Alert, Form, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import SEO from './SEO';
import { fetchPartDetails } from '../services/api';
import { transformPartData } from '../utils/dataTransformers';
import { useCart } from '../context/CartContext';

// Fields that shouldn't be user-selectable as a spec search filter because they
// wouldn't yield useful "similar parts" results (e.g. the exact part number).
const NON_FILTERABLE_SPEC_KEYS = new Set(['part_number']);

const ProductSpecsCard = ({ part, selectedSpecs, onToggleSpec, onSearch }) => {
  // Count how many spec values are currently selected across all sections.
  const selectedCount = Object.values(selectedSpecs).reduce(
    (acc, values) => acc + (values ? values.length : 0),
    0
  );

  const isSpecValueSelected = (key, value) => {
    const selected = selectedSpecs[key];
    return Array.isArray(selected) && selected.includes(value);
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white py-3 border-bottom">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="mb-0 fw-bold">Product Specifications</h5>
          <Button
            variant="primary"
            size="sm"
            onClick={onSearch}
          >
            <FontAwesomeIcon icon={faSearch} className="me-2" />
            Search similar parts{selectedCount > 0 ? ` (${selectedCount})` : ''}
          </Button>
        </div>
        <div className="text-muted small mt-2">
          Check specs below to narrow the search. Category and subcategory are always included.
        </div>
      </Card.Header>
      <Card.Body>
        {Object.entries(part.specifications).map(([section, specs], idx, arr) => (
          <div key={section} className={`mb-4 pb-4 ${idx < arr.length - 1 ? 'border-bottom' : ''}`}>
            <h6 className="text-uppercase small fw-bold text-muted border-bottom pb-2 mb-3 text-center">{section}</h6>
            <Table bordered hover size="sm" className="mb-0">
              <tbody>
                {specs.map(({ key, label, value }) => {
                  const isList = Array.isArray(value);
                  const filterable = !NON_FILTERABLE_SPEC_KEYS.has(key);
                  return (
                    <tr key={key}>
                      <td className="bg-light fw-bold text-muted border-end" style={{ width: '30%' }}>{label}</td>
                      <td>
                        {isList ? (
                          <div className="d-flex flex-column gap-1">
                            {value.map((item) => (
                              <Form.Check
                                key={`${key}-${item}`}
                                type="checkbox"
                                id={`spec-${key}-${item}`}
                                label={String(item)}
                                checked={isSpecValueSelected(key, item)}
                                onChange={() => onToggleSpec(key, item)}
                                disabled={!filterable}
                              />
                            ))}
                          </div>
                        ) : (
                          <Form.Check
                            type="checkbox"
                            id={`spec-${key}`}
                            label={String(value)}
                            checked={isSpecValueSelected(key, value)}
                            onChange={() => onToggleSpec(key, value)}
                            disabled={!filterable}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

// Given a list of price breaks and a quantity, return the price associated
// with the highest break_qty that is still <= qty. Returns null when no
// break qualifies (e.g. the lowest break_qty is greater than qty, or the
// price break list is empty/invalid).
export const findUnitPriceForQty = (priceBreaks, qty) => {
  if (!Array.isArray(priceBreaks) || priceBreaks.length === 0) return null;
  const numericQty = Number(qty);
  if (!Number.isFinite(numericQty) || numericQty < 1) return null;
  const eligible = priceBreaks
    .filter((pb) => pb && Number(pb.price) > 0 && Number(pb.break_qty) <= numericQty)
    .sort((a, b) => Number(b.break_qty) - Number(a.break_qty));
  if (eligible.length === 0) return null;
  return Number(eligible[0].price);
};

// Normalise the part's price_breaks (which use `break_qty`) to the shape the
// cart/order backends expect (`min_qty`). Drops rows without a positive price.
const toCartPriceBreaks = (priceBreaks) =>
  (priceBreaks || [])
    .filter((pb) => pb && Number(pb.price) > 0 && Number(pb.break_qty) >= 1)
    .map((pb) => ({ min_qty: Number(pb.break_qty), price: Number(pb.price) }));

const PartDetail = () => {
  const { partNumber } = useParams();
  const navigate = useNavigate();
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  // Map of original spec key -> array of selected values (supports list specs)
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const { addToCart } = useCart();

  // Clamp a requested quantity to [1, totalQuantity]. When totalQuantity is
  // unknown/zero we still enforce a floor of 1 but don't cap.
  const clampQuantity = (raw) => {
    const parsed = parseInt(raw, 10);
    const n = Number.isFinite(parsed) ? parsed : 1;
    const floored = Math.max(1, n);
    const max = Number(part?.totalQuantity) || 0;
    if (max > 0) return Math.min(floored, max);
    return floored;
  };

  const handleQuantityChange = (value) => {
    setQuantity(clampQuantity(value));
  };

  const unitPrice = part ? findUnitPriceForQty(part.priceBreaks, quantity) : null;
  const subtotal = unitPrice != null ? unitPrice * quantity : null;

  const handleAddToCart = () => {
    if (!part) return;
    const cartItem = {
      partNumber: part.partNumber,
      manufacturer: part.manufacturer,
      quantity,
    };
    // Only attach pricing metadata when we actually have a matching break;
    // downstream code treats missing unit_price as "pricing TBD by admin".
    if (unitPrice != null) {
      cartItem.unit_price = unitPrice;
    }
    const priceBreaks = toCartPriceBreaks(part.priceBreaks);
    if (priceBreaks.length > 0) {
      cartItem.price_breaks = priceBreaks;
    }
    addToCart(cartItem);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  // Toggle a single spec value on or off.
  const handleToggleSpec = (key, value) => {
    setSelectedSpecs((prev) => {
      const current = prev[key] ? [...prev[key]] : [];
      const idx = current.indexOf(value);
      if (idx > -1) {
        current.splice(idx, 1);
      } else {
        current.push(value);
      }
      const next = { ...prev };
      if (current.length === 0) {
        delete next[key];
      } else {
        next[key] = current;
      }
      return next;
    });
  };

  // Build a search URL that always includes category/subcategory and any
  // selected spec values (joined with "||" to match the SearchResults format).
  const handleSpecSearch = () => {
    if (!part) return;
    const params = new URLSearchParams();
    if (part.category) params.append('category', part.category);
    if (part.subcategory) params.append('subcategory', part.subcategory);
    Object.entries(selectedSpecs).forEach(([key, values]) => {
      if (values && values.length > 0) {
        params.append(key, values.join('||'));
      }
    });
    navigate(`/search?${params.toString()}`);
  };

  useEffect(() => {
    const loadPartDetails = async () => {
      setLoading(true);
      // Reset any selected specs when navigating to a new part.
      setSelectedSpecs({});
      try {
        const apiData = await fetchPartDetails(partNumber);
        const transformedData = transformPartData(apiData, partNumber);
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
  const formatCurrency = (amount) =>
    `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  const maxQuantity = Number(part.totalQuantity) || 0;

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
          <Col lg={8} xs={12} className="order-1">
            {/* Header card */}
            <Card className="shadow-sm mb-4">
              <Card.Body>
                {/* Part Number Heading */}
                <h1 className="h2 mb-3 pb-3 border-bottom part-number text-center" style={{ fontWeight: 400 }}>{part.partNumber}</h1>
                <Row>
                  {/* Image Section */}
                  <Col md={5} className="mb-4 mb-md-0 border-end-md">
                    <div className="border p-3 rounded bg-white text-center d-flex align-items-center justify-content-center" style={{ minHeight: '250px' }}>
                      <div className="image-overlay-wrapper">
                          <img
                            src={part.image}
                            alt={part.partNumber}
                            className="part-image"
                            loading="lazy"
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
                      {part.description && (
                        <p className="text-muted pb-3 mb-3 border-bottom">{part.description}</p>
                      )}

                      <Table bordered size="sm" className="mb-0">
                        <tbody>
                          <tr>
                            <td className="fw-bold py-1 bg-light" style={{ width: '120px' }}>Manufacturer</td>
                            <td className="py-1"><Link to={`/search?manufacturer=${part.manufacturer}`} className="text-decoration-none">{part.manufacturer}</Link></td>
                          </tr>
                          <tr>
                            <td className="fw-bold py-1 bg-light">Part #</td>
                            <td className="py-1 part-number">{part.partNumber}</td>
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
            {/* 2. Specs Card (Desktop: Below Header | Mobile: Below Pricing) */}
            {/* Use d-none and d-lg-block to only show this version on desktop */}
            <div className="d-none d-lg-block">
              <ProductSpecsCard
                part={part}
                selectedSpecs={selectedSpecs}
                onToggleSpec={handleToggleSpec}
                onSearch={handleSpecSearch}
              />
            </div>
          </Col>
          {/* Right Column: Pricing Card */}
          <Col lg={4} xs={12} className="order-2">
            <Card className="shadow-sm sticky-pricing-card">
              <Card.Body className="p-0">
                <div className="px-3 py-2 border-bottom text-center">
                  <span className="h3 text-success fw-bold mb-0">{formatQuantity(part.totalQuantity)}</span>
                  <span className="text-muted ms-2">{part.pricingType || "available"}</span>
                </div>

                <div className="bg-light px-3 py-2 border-top border-bottom">
                  <Form.Group className="mb-2">
                    <InputGroup size="md">
                      <InputGroup.Text className="bg-white text-muted small fw-bold">QTY</InputGroup.Text>
                      <Form.Control
                        type="number"
                        min={1}
                        max={maxQuantity > 0 ? maxQuantity : undefined}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                      />
                    </InputGroup>
                    {maxQuantity > 0 && quantity >= maxQuantity && (
                      <Form.Text className="text-muted">
                        Maximum available: {formatQuantity(maxQuantity)}
                      </Form.Text>
                    )}
                  </Form.Group>
                  {subtotal != null && (
                    <div className="d-flex justify-content-between align-items-baseline mb-2 small">
                      <span className="text-muted">
                        Subtotal <span className="text-muted">({formatCurrency(unitPrice)} ea.)</span>
                      </span>
                      <span className="fw-bold">{formatCurrency(subtotal)}</span>
                    </div>
                  )}
                  <Button
                    variant="primary"
                    size="md"
                    className="w-100 fw-bold shadow-sm"
                    onClick={handleAddToCart}
                    disabled={maxQuantity === 0}
                  >
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

          {/* Column 3: Specs for Mobile Only */}
          <Col xs={12} className="order-3 d-block d-lg-none">
            <ProductSpecsCard
              part={part}
              selectedSpecs={selectedSpecs}
              onToggleSpec={handleToggleSpec}
              onSearch={handleSpecSearch}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PartDetail;
