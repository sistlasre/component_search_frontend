import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Form, Button, Alert } from 'react-bootstrap';
import { useCart } from '../context/CartContext';

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
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const payload = {
      contact: { ...form },
      items: cartItems.map((item) => ({
        partNumber: item.partNumber,
        manufacturer: item.manufacturer,
        quantity: item.quantity,
      })),
    };

    // Ready for future backend API call
    console.log('Checkout payload:', payload);

    clearCart();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Container className="py-5 text-center">
        <div className="mb-4">
          <span style={{ fontSize: '3rem' }}>✓</span>
        </div>
        <h2 className="mb-3">Order Submitted!</h2>
        <p className="text-muted mb-4">
          Thank you for your order. We will review your request and reach out to you shortly.
        </p>
        <Button as={Link} to="/" variant="primary">
          Back to Home
        </Button>
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
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.partNumber}>
                      <td className="py-2">{item.partNumber}</td>
                      <td className="py-2">{item.manufacturer}</td>
                      <td className="py-2 text-center">{item.quantity.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
            <Card.Footer className="bg-white text-muted small">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in order
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

                <Button type="submit" variant="primary" size="lg" className="w-100 fw-bold">
                  Submit Order
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
