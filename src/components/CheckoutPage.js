import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Form, Button, Alert, Badge, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useCart, computeUnitPriceForQty } from '../context/CartContext';
import { apiService } from '../services/userManagementService';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (amount) =>
  `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;

// Pick the best available unit price for the given quantity: prefer a live
// recomputation from price_breaks, then fall back to the stored unit_price.
const effectiveUnitPrice = (item, qty) => {
  const recomputed = computeUnitPriceForQty(item.price_breaks, qty);
  if (recomputed != null) return recomputed;
  if (item.unit_price != null && Number.isFinite(Number(item.unit_price))) {
    return Number(item.unit_price);
  }
  return null;
};

const initialForm = {
  fullName: '',
  company: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  notes: '',
};

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  // 'order' = firm purchase; 'request' = inquiry (may include notes, pricing TBD)
  const [recordType, setRecordType] = useState('order');
  const [submittedRecord, setSubmittedRecord] = useState(null);
  // Purchase order PDF (required for orders, optional for requests).
  const [purchaseOrderFile, setPurchaseOrderFile] = useState(null);
  const [purchaseOrderError, setPurchaseOrderError] = useState('');

  // Order summary totals derived from the current cart. Items without
  // pricing info contribute 0 to the grand total.
  const grandTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = effectiveUnitPrice(item, item.quantity);
      if (price == null) return sum;
      return sum + price * Number(item.quantity || 0);
    }, 0);
  }, [cartItems]);
  const hasAnyPricing = cartItems.some((i) => effectiveUnitPrice(i, i.quantity) != null);

  // True when any line item's requested qty exceeds available stock (or stock is 0).
  // When true, the submission is automatically treated as a request instead of an order.
  const hasExceedsStock = useMemo(() => {
    return cartItems.some((item) => {
      const avail = item.availableQuantity;
      if (avail == null) return false;
      return avail === 0 || item.quantity > avail;
    });
  }, [cartItems]);

  const fillFormFromUserInfo = async () => {
    if (user) {
      const response = await apiService.getUser();
      const userData = response.data?.requesting_user || null;
      const topLevelUserInfo = {
        fullName: userData.first_name + " " + userData.last_name,
        email: userData.email
      };
      let shippingAddress;
      // Handle stringified JSON from the database
      if (userData && typeof userData.shipping_address === 'string') {
        try {
          shippingAddress = JSON.parse(userData.shipping_address);
        } catch (e) {
          console.error("Failed to parse shipping address", e);
          shippingAddress = { street: '', city: '', state: '', zip: '' };
        }
      }
      setForm({
        ...form,
        ...topLevelUserInfo,
        ...shippingAddress
      });
    }
  };

  useEffect(() => {
    fillFormFromUserInfo();
  }, [user]);

  // Force record type to 'request' when any item exceeds available stock.
  useEffect(() => {
    if (hasExceedsStock) {
      setRecordType('request');
    }
  }, [hasExceedsStock]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePurchaseOrderChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPurchaseOrderError('');
    if (file && file.type !== 'application/pdf') {
      setPurchaseOrderError('Purchase order must be a PDF file.');
      setPurchaseOrderFile(null);
      e.target.value = '';
      return;
    }
    setPurchaseOrderFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Orders MUST have a PO attached; requests are optional.
    if (recordType === 'order' && !purchaseOrderFile) {
      setPurchaseOrderError('Please attach a purchase order PDF to submit an order.');
      setValidated(true);
      return;
    }

    const { notes, ...contact } = form;

    const payload = {
      recordType,
      contact,
      notes,
      items: cartItems.map((item) => {
        const unitPrice = effectiveUnitPrice(item, item.quantity);
        const lineItem = {
          part_number: item.partNumber,
          manufacturer: item.manufacturer,
          quantity: item.quantity,
        };
        if (unitPrice != null) {
          lineItem.unit_price = unitPrice;
        }
        if (Array.isArray(item.price_breaks) && item.price_breaks.length > 0) {
          lineItem.price_breaks = item.price_breaks.map((pb) => ({
            min_qty: Number(pb.min_qty),
            price: Number(pb.price),
          }));
        }
        return lineItem;
      }),
    };

    setSubmitting(true);
    setSubmitError('');
    try {
      // Upload the PO PDF first (if any) so the order record can reference
      // the resulting S3 key. This also avoids creating an order record when
      // the upload itself fails.
      if (purchaseOrderFile) {
        payload.purchaseOrder = await apiService.uploadPurchaseOrderPdf(purchaseOrderFile);
      }

      const resp = await apiService.createOrder(payload);
      setSubmittedRecord(resp.data?.record || null);
      // Both Orders and Requests clear the cart on submission.
      await clearCart();
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Submission failed';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const submittedWasRequest = submittedRecord?.record_type === 'request';
    const headline = submittedWasRequest ? 'Request Submitted!' : 'Order Submitted!';
    const subline = submittedWasRequest
      ? 'Thank you — your inquiry has been received. Our team will review and respond shortly.'
      : 'Thank you for your order. We will review and follow up with you shortly.';
    return (
      <Container className="py-5 text-center">
        <div className="mb-4">
          <span style={{ fontSize: '3rem' }}>✓</span>
        </div>
        <h2 className="mb-3">{headline}</h2>
        <p className="text-muted mb-2">{subline}</p>
        {submittedRecord?.record_id && (
          <p className="text-muted mb-4">
            Reference ID: <code>{submittedRecord.record_id}</code>
          </p>
        )}
        <div className="d-flex justify-content-center gap-2">
          {user && (
            <Button as={Link} to="/orders" variant="outline-primary">
              View My Orders &amp; Requests
            </Button>
          )}
          <Button as={Link} to="/" variant="primary">
            Back to Home
          </Button>
        </div>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h3 className="mb-3">Your cart is empty</h3>
        <p className="text-muted mb-4">Add items to your cart before checking out.</p>
        <Button as={Link} to="/" variant="primary">
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4" style={{ fontWeight: 400 }}>Checkout</h2>

      <Row>
        {/* Order Summary */}
        <Col lg={5} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-bold">Order Summary</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table bordered hover size="sm" className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-2">Part Number</th>
                    <th className="py-2">Manufacturer</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-end">Unit Price</th>
                    <th className="py-2 text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const unit = effectiveUnitPrice(item, item.quantity);
                    const subtotal = unit != null ? unit * Number(item.quantity || 0) : null;
                    return (
                      <tr key={item.partNumber}>
                        <td className="py-2">
                          <Link className="part-number" to={`/part/${encodeURIComponent(item.partNumber)}`} target="_blank" rel="noopener noreferrer">
                            {item.partNumber}
                          </Link>
                        </td>
                        <td className="py-2">{item.manufacturer}</td>
                        <td className="py-2 text-center">
                          {item.quantity.toLocaleString()}
                          {item.availableQuantity != null && (item.availableQuantity === 0 || item.quantity > item.availableQuantity) && (
                            <Badge bg="warning" text="dark" className="ms-1" title={item.availableQuantity === 0 ? 'Out of stock' : `Only ${item.availableQuantity.toLocaleString()} available`}>!</Badge>
                          )}
                        </td>
                        <td className="py-2 text-end">
                          {unit != null ? formatCurrency(unit) : <span className="text-muted">—</span>}
                        </td>
                        <td className="py-2 text-end">
                          {subtotal != null ? formatCurrency(subtotal) : <span className="text-muted">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {hasAnyPricing && (
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="py-2 text-end fw-bold">Total</td>
                      <td className="py-2 text-end fw-bold">{formatCurrency(grandTotal)}</td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </Card.Body>
            <Card.Footer className="bg-white text-muted small">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in order
              {hasAnyPricing && recordType === 'request' && (
                <span className="ms-2">(pricing indicative — final pricing confirmed during quote)</span>
              )}
            </Card.Footer>
          </Card>

          <Button as={Link} to="/cart" variant="outline-secondary" size="sm" className="mt-3">
            ← Edit Cart
          </Button>
        </Col>

        {/* Contact & Shipping Form */}
        <Col lg={7}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-bold">Contact &amp; Shipping Information</h5>
            </Card.Header>
            <Card.Body>
              {submitError && <Alert variant="danger">{submitError}</Alert>}

              <div className="mb-3">
                <div className="mb-2 fw-semibold">What would you like to submit?</div>
                <ToggleButtonGroup
                  type="radio"
                  name="recordType"
                  value={recordType}
                  onChange={setRecordType}
                >
                  <ToggleButton id="rt-order" value="order" variant={recordType === 'order' ? 'primary' : 'outline-primary'} disabled={hasExceedsStock}>
                    Order
                  </ToggleButton>
                  <ToggleButton id="rt-request" value="request" variant={recordType === 'request' ? 'primary' : 'outline-primary'}>
                    Request / Inquiry
                  </ToggleButton>
                </ToggleButtonGroup>
                <div className="text-muted small mt-1">
                  {recordType === 'order'
                    ? 'Firm purchase — we\u2019ll follow up to finalize shipping and pricing.'
                    : 'Inquiry only — use the notes field below to describe what you need. Pricing may be provided back to you.'}
                </div>
                {hasExceedsStock && (
                  <Alert variant="warning" className="mt-2 mb-0 py-2 small">
                    One or more items in your cart exceed available stock or are out of stock. This submission will be processed as a request.
                  </Alert>
                )}
              </div>

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="fullName">
                      <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        required
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                      />
                      <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="company">
                      <Form.Label>Company Name</Form.Label>
                      <Form.Control
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Acme Corp"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="email">
                      <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        required
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                      />
                      <Form.Control.Feedback type="invalid">Valid email required.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="phone">
                      <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        required
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                      />
                      <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="street">
                  <Form.Label>Street Address <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    required
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    placeholder="123 Main St"
                  />
                  <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
                </Form.Group>

                <Row className="mb-3">
                  <Col md={5}>
                    <Form.Group controlId="city">
                      <Form.Label>City <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        required
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Los Angeles"
                      />
                      <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="state">
                      <Form.Label>State <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        required
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        placeholder="CA"
                      />
                      <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="zip">
                      <Form.Label>ZIP Code <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        required
                        name="zip"
                        value={form.zip}
                        onChange={handleChange}
                        placeholder="90001"
                      />
                      <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4" controlId="notes">
                  <Form.Label>Notes (optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions or requirements..."
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="purchaseOrder">
                  <Form.Label>
                    Purchase Order (PDF)
                    {recordType === 'order' && <span className="text-danger"> *</span>}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept="application/pdf"
                    onChange={handlePurchaseOrderChange}
                    isInvalid={!!purchaseOrderError}
                  />
                  <Form.Text className="text-muted">
                    {recordType === 'order'
                      ? 'Attach your PO as a PDF. It will be stored with your order.'
                      : 'Optional for requests \u2014 attach a PO PDF if you have one.'}
                  </Form.Text>
                  {purchaseOrderError && (
                    <Form.Control.Feedback type="invalid">{purchaseOrderError}</Form.Control.Feedback>
                  )}
                  {purchaseOrderFile && (
                    <div className="small text-success mt-1">
                      Selected: {purchaseOrderFile.name} ({Math.round(purchaseOrderFile.size / 1024)} KB)
                    </div>
                  )}
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 fw-bold"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Submitting…'
                    : recordType === 'order'
                      ? 'Submit Order'
                      : 'Submit Request'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;
