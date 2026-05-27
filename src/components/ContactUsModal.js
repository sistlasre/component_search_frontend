import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { apiService } from '../services/userManagementService';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  phone: '',
  subject: '',
  message: '',
};

/**
 * Reusable Contact Us modal.
 *
 * Props:
 *  - show: boolean — whether the modal is visible
 *  - onHide: () => void — called when the modal should close
 *  - defaultSubject?: string — pre-filled subject line (e.g. derived from the CTA source)
 *  - source?: string — free-form label identifying where the user opened the modal from
 *    (included in the outbound email so the recipient can see what page triggered it)
 */
const ContactUsModal = ({ show, onHide, defaultSubject = '', source = '' }) => {
  const [form, setForm] = useState({ ...EMPTY_FORM, subject: defaultSubject });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset / re-seed the form whenever the modal is (re)opened with a new subject.
  useEffect(() => {
    if (show) {
      setForm({ ...EMPTY_FORM, subject: defaultSubject });
      setError('');
      setSuccess(false);
      setSubmitting(false);
    }
  }, [show, defaultSubject]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.company.trim()) {
      setError('Company is required.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!form.message.trim()) {
      setError('Please include a message.');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.submitContactForm({
        name: [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(' '),
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        source: source || '',
      });
      setSuccess(true);
    } catch (err) {
      console.error('Contact form submission error:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Something went wrong sending your message. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop={submitting ? 'static' : true}>
      <Modal.Header closeButton={!submitting}>
        <Modal.Title className="fw-bold">Contact Us</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {success ? (
          <Alert variant="success" className="mb-0">
            <h5 className="fw-bold">Thanks — your message is on its way.</h5>
            <p className="mb-0">
              A member of our team will follow up with you shortly at{' '}
              <strong>{form.email || 'the email you provided'}</strong>.
            </p>
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <p className="text-muted mb-4">
              Tell us a bit about what you need and we'll get back to you.
              Fields marked with <span className="text-danger">*</span> are required.
            </p>

            <Row className="g-3 mb-2">
              <Col md={6}>
                <Form.Group controlId="contactFirstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.firstName}
                    onChange={handleChange('firstName')}
                    disabled={submitting}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="contactLastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.lastName}
                    onChange={handleChange('lastName')}
                    disabled={submitting}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-2">
              <Col>
                <Form.Group controlId="contactCompany">
                  <Form.Label>Company<span className="text-danger"> *</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={form.company}
                    onChange={handleChange('company')}
                    disabled={submitting}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-2">
              <Col md={6}>
                <Form.Group controlId="contactEmail">
                  <Form.Label>Email<span className="text-danger"> *</span></Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    disabled={submitting}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="contactPhone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    disabled={submitting}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-2">
              <Col xs={12}>
                <Form.Group controlId="contactSubject">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.subject}
                    onChange={handleChange('subject')}
                    disabled={submitting}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3">
              <Col xs={12}>
                <Form.Group controlId="contactMessage">
                  <Form.Label>Message<span className="text-danger"> *</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={form.message}
                    onChange={handleChange('message')}
                    disabled={submitting}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        {success ? (
          <Button variant="primary" onClick={onHide}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="outline-secondary" onClick={onHide} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Sending…
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ContactUsModal;
