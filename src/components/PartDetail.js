import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Breadcrumb, Alert, Form, Button, InputGroup, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTag, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet-async';
import SEO from './SEO';
import { fetchPartDetails } from '../services/api';
import { transformPartData } from '../utils/dataTransformers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/userManagementService';

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
  const { partId } = useParams();
  const [searchParams] = useSearchParams();
  const pi = searchParams.get('pi');
  const navigate = useNavigate();
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  // Map of original spec key -> array of selected values (supports list specs)
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const { addToCart } = useCart();
  const { user } = useAuth();

  // State for the "Request Discounted Pricing" card. This flow bypasses the
  // cart/checkout and submits directly as a `request` record to /orders.
  // fullName + email are required by the backend for any record submission;
  // we prefill them from the signed-in user's profile when available, but
  // anonymous users can fill them in manually.
  const [discountQty, setDiscountQty] = useState(1);
  const [discountNotes, setDiscountNotes] = useState('');
  const [discountFullName, setDiscountFullName] = useState('');
  const [discountEmail, setDiscountEmail] = useState('');
  const [submittingDiscountRequest, setSubmittingDiscountRequest] = useState(false);
  const [discountRequestError, setDiscountRequestError] = useState('');
  const [discountRequestRecordId, setDiscountRequestRecordId] = useState(null);
  // Form is collapsed by default to keep the pricing card compact; users
  // expand it only when they want to submit a discount request.
  const [discountExpanded, setDiscountExpanded] = useState(true);

  // Clamp a requested quantity to [1, totalQuantity]. When totalQuantity is
  // unknown/zero we still enforce a floor of 1 but don't cap.
  const clampQuantity = (raw) => {
    const parsed = parseInt(raw, 10);
    const n = Number.isFinite(parsed) ? parsed : 1;
    return Math.max(1, n);
  };

  const handleQuantityChange = (value) => {
    setQuantity(clampQuantity(value));
  };

  const unitPrice = part ? findUnitPriceForQty(part.priceBreaks, quantity) : null;
  const subtotal = unitPrice != null ? unitPrice * quantity : null;

  const handleAddToCart = () => {
    if (!part) return;
    const cartItem = {
      partId,
      partNumber: part.partNumber,
      manufacturer: part.manufacturer,
      quantity,
      availableQuantity: maxQuantity,
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

  // Clamp the discount-request qty the same way as the add-to-cart qty, but
  // don't cap by totalQuantity: discount requests are a pre-purchase inquiry
  // and the requested qty can legitimately exceed on-hand stock.
  const handleDiscountQtyChange = (value) => {
    const parsed = parseInt(value, 10);
    const n = Number.isFinite(parsed) ? parsed : 1;
    setDiscountQty(Math.max(1, n));
  };

  // Submit a discount-pricing inquiry directly to /orders as a `request`
  // record. Bypasses the cart entirely.
  const handleRequestDiscountedPricing = async () => {
    if (!part) return;
    const qty = parseInt(discountQty, 10);
    if (!Number.isFinite(qty) || qty < 1) {
      setDiscountRequestError('Please enter a valid quantity.');
      return;
    }
    const trimmedName = discountFullName.trim();
    const trimmedEmail = discountEmail.trim();
    if (!trimmedName || !trimmedEmail) {
      setDiscountRequestError('Full name and email are required.');
      return;
    }

    setSubmittingDiscountRequest(true);
    setDiscountRequestError('');
    setDiscountRequestRecordId(null);
    try {
      const lineItem = {
        part_number: part.partNumber,
        manufacturer: part.manufacturer,
        quantity: qty,
      };
      const priceBreaks = toCartPriceBreaks(part.priceBreaks);
      if (priceBreaks.length > 0) {
        lineItem.price_breaks = priceBreaks;
      }

      const resp = await apiService.createOrder({
        recordType: 'request',
        contact: { fullName: trimmedName, email: trimmedEmail },
        items: [lineItem],
        notes: discountNotes
          ? `[Discounted pricing request] ${discountNotes}`
          : '[Discounted pricing request]',
      });
      const recordId = resp.data?.record?.record_id || null;
      setDiscountRequestRecordId(recordId);
      // Reset the free-form fields but keep prefilled contact info for
      // potential subsequent requests on this page.
      setDiscountNotes('');
      setDiscountQty(1);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to submit request. Please try again.';
      setDiscountRequestError(msg);
    } finally {
      setSubmittingDiscountRequest(false);
    }
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
        const apiData = await fetchPartDetails(partId, pi);
        const transformedData = transformPartData(apiData, partId.split("__")[0]);
        setPart(transformedData);
      } catch (error) {
        console.error('Error fetching part details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPartDetails();
  }, [partId, pi]);

  // Prefill the discount-request contact fields from the signed-in user's
  // profile. Anonymous visitors simply see blank fields they can fill in.
  useEffect(() => {
    let cancelled = false;
    const prefill = async () => {
      if (!user) return;
      try {
        const response = await apiService.getUser();
        if (cancelled) return;
        const userData = response.data?.requesting_user || {};
        const fullName = [userData.first_name, userData.last_name].filter(Boolean).join(' ').trim();
        if (fullName) setDiscountFullName((prev) => prev || fullName);
        if (userData.email) setDiscountEmail((prev) => prev || userData.email);
      } catch (err) {
        // Non-fatal: user can still type their info manually.
        console.warn('Failed to prefill discount request contact info:', err);
      }
    };
    prefill();
    return () => { cancelled = true; };
  }, [user]);

  const BASE_URL = 'https://www.componentsearch.com';
  const pageUrl = `${BASE_URL}/part/${partId}`;

  // Build JSON-LD structured data for Google rich results.
  // Must be above early returns so hook call order is stable.
  const jsonLd = useMemo(() => {
    if (!part) return [];
    const validBreaks = (part.priceBreaks || []).filter((pb) => pb && Number(pb.price) > 0);
    const prices = validBreaks.map((pb) => Number(pb.price));

    // --- Product schema ---
    const product = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: part.partNumber,
      sku: part.partNumber,
      mpn: part.partNumber,
      description: part.description || `${part.partNumber} by ${part.manufacturer}`,
      image: part.image ? `${BASE_URL}${part.image}` : undefined,
      url: pageUrl,
      brand: part.manufacturer
        ? { '@type': 'Brand', name: part.manufacturer }
        : undefined,
      category: [part.category, part.subcategory].filter(Boolean).join(' > ') || undefined,
    };

    // Offers — use AggregateOffer when there are multiple price breaks.
    if (prices.length > 1) {
      product.offers = {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: Math.min(...prices).toFixed(4),
        highPrice: Math.max(...prices).toFixed(4),
        offerCount: validBreaks.length,
        availability:
          part.totalQuantity > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'Component Search' },
      };
    } else if (prices.length === 1) {
      product.offers = {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: prices[0].toFixed(4),
        availability:
          part.totalQuantity > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'Component Search' },
      };
    }

    // --- BreadcrumbList schema ---
    const breadcrumbItems = [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Search', url: `${BASE_URL}/search` },
      { name: part.category, url: `${BASE_URL}/search?category=${encodeURIComponent(part.category)}` },
    ];
    if (part.subcategory) {
      breadcrumbItems.push({
        name: part.subcategory,
        url: `${BASE_URL}/search?category=${encodeURIComponent(part.category)}&subcategory=${encodeURIComponent(part.subcategory)}`,
      });
    }
    breadcrumbItems.push({ name: part.partNumber, url: pageUrl });

    const breadcrumbList = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        item: item.url,
      })),
    };

    return [product, breadcrumbList];
  }, [part, partId, pageUrl]);

  if (loading) return <Container className="py-5 text-center"><div className="spinner-border text-primary" /></Container>;
  if (!part) return <Container className="py-5"><Alert variant="warning">Part Not Found</Alert></Container>;

  const formatQuantity = (qty) => Number(qty).toLocaleString();
  const formatCurrency = (amount) =>
    `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  const maxQuantity = Number(part.totalQuantity) || 0;

  let seoTitle = part.partNumber;
  if (part.manufacturer) {
    seoTitle += ` - ${part.manufacturer}`;
  }

  const seoDescription = part.description
    ? `${part.partNumber} by ${part.manufacturer} — ${part.description}. Check pricing, availability & specs.`
    : `${part.partNumber} by ${part.manufacturer}. Check pricing, availability & specs on Component Search.`;

  const seoKeywords = [
    part.partNumber,
    part.manufacturer,
    part.category,
    part.subcategory,
    'electronic components',
    'buy',
    'datasheet',
    'price',
    'in stock',
  ].filter(Boolean).join(', ');

  const seoImage = part.image
    ? (part.image.startsWith('http') ? part.image : `${BASE_URL}${part.image}`)
    : undefined;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        image={seoImage}
        url={pageUrl}
        type="product"
        author={part.manufacturer}
      />
      <Helmet>
        {jsonLd.map((schema, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

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
                {part.totalQuantity > 0 && (
                    <div className="px-3 py-2 border-bottom text-center">
                      <span className="h3 text-success fw-bold mb-0">{formatQuantity(part.totalQuantity)}</span>
                      <span className="text-muted ms-2">{part.pricingType || "available"}</span>
                    </div>
                  )}

                <div className="bg-light px-3 py-2 border-top border-bottom">
                  <Form.Group className="mb-2">
                    <InputGroup size="md">
                      <InputGroup.Text className="bg-white text-muted small fw-bold">QTY</InputGroup.Text>
                      <Form.Control
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                      />
                    </InputGroup>
                    {maxQuantity > 0 && quantity > maxQuantity && (
                      <Alert variant="warning" className="mt-2 mb-0 py-1 small">
                        Quantity exceeds available stock ({formatQuantity(maxQuantity)} available). This will be submitted as a request at checkout.
                      </Alert>
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
                  {subtotal != null && subtotal < 100 && (
                    <Alert variant="warning" className="mb-2 py-1 small">
                      Line item total ({formatCurrency(subtotal)}) is below the $100 minimum. This will be submitted as a request at checkout.
                    </Alert>
                  )}
                  <Button
                    variant="primary"
                    size="md"
                    className="w-100 fw-bold shadow-sm"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                  {addedToCart && (
                    <Alert variant="success" className="mt-2 mb-0 py-1 text-center small border-0">
                      Added to cart!
                    </Alert>
                  )}
                </div>
                {part.totalQuantity > 0 && (
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
                )}
                <div className="px-3 py-2 text-center">
                  <div className="d-flex justify-content-center gap-3">
                    <img src="/visa.webp" alt="Visa" className="img-fluid" style={{ maxHeight: '40px' }} />
                    <img src="/mastercard.webp" alt="Mastercard" className="img-fluid" style={{ maxHeight: '40px' }} />
                    <img src="/amex.webp" alt="American Express" className="img-fluid" style={{ maxHeight: '40px' }} />
                    <img src="/discover.webp" alt="Discover" className="img-fluid" style={{ maxHeight: '40px' }} />
                  </div>
                </div>

                {/* Request Discounted Pricing section: submits a `request`
                    record directly to /orders without touching the cart.
                    The form itself is collapsed by default; the title +
                    description act as a clickable toggle. */}
                 <div className="border-top">
                  <button
                    type="button"
                    className="btn btn-link w-100 text-start text-decoration-none text-dark px-3 py-3"
                    onClick={() => setDiscountExpanded((v) => !v)}
                    aria-expanded={discountExpanded}
                    aria-controls="discount-request-form"
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faTag} className="me-2 text-primary" />
                        <h6 className="mb-0 fw-bold">
                          {part.priceBreaks && part.priceBreaks.length > 0 ? "Request Discounted Pricing" : "Request Pricing"}
                        </h6>
                      </div>
                      <FontAwesomeIcon
                        icon={discountExpanded ? faChevronUp : faChevronDown}
                        className="text-muted small"
                      />
                    </div>
                    <p className="text-muted small mb-0">
                      Buying in volume? Submit a quick request and our team will get back to you with a custom quote.
                    </p>
                  </button>
                  <Collapse in={discountExpanded}>
                    <div id="discount-request-form">
                      <div className="px-3 pb-3">
                        {discountRequestError && (
                          <Alert variant="danger" className="py-2 small">
                            {discountRequestError}
                          </Alert>
                        )}
                        {discountRequestRecordId && (
                          <Alert variant="success" className="py-2 small">
                            Request submitted! Reference ID: <code>{discountRequestRecordId}</code>
                          </Alert>
                        )}
                        <Form.Group className="mb-2" controlId="discount-qty">
                          <Form.Label className="small fw-bold mb-1">
                            Quantity <span className="text-danger">*</span>
                          </Form.Label>
                          <InputGroup size="sm">
                            <InputGroup.Text className="bg-white text-muted small fw-bold">QTY</InputGroup.Text>
                            <Form.Control
                              type="number"
                              min={1}
                              value={discountQty}
                              onChange={(e) => handleDiscountQtyChange(e.target.value)}
                            />
                          </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-2" controlId="discount-full-name">
                          <Form.Label className="small fw-bold mb-1">
                            Full Name <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={discountFullName}
                            onChange={(e) => setDiscountFullName(e.target.value)}
                            placeholder="John Doe"
                          />
                        </Form.Group>
                        <Form.Group className="mb-2" controlId="discount-email">
                          <Form.Label className="small fw-bold mb-1">
                            Email <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            size="sm"
                            type="email"
                            value={discountEmail}
                            onChange={(e) => setDiscountEmail(e.target.value)}
                            placeholder="john@example.com"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="discount-notes">
                          <Form.Label className="small fw-bold mb-1">Notes (optional)</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={discountNotes}
                            onChange={(e) => setDiscountNotes(e.target.value)}
                            placeholder="Target price, timing, or other details..."
                          />
                        </Form.Group>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="w-100 fw-bold"
                          onClick={handleRequestDiscountedPricing}
                          disabled={submittingDiscountRequest}
                        >
                          {submittingDiscountRequest ? 'Submitting…' : part.priceBreaks && part.priceBreaks.length > 0 ? "Request Discounted Pricing" : "Request Pricing"}
                        </Button>
                      </div>
                    </div>
                  </Collapse>
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
