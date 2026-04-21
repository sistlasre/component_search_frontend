import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUser, faLock, faEnvelope, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import SEO from './SEO';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await register(
        formData.username.trim() || formData.email.trim(),
        formData.password,
        formData.email.trim(),
        formData.firstName.trim(),
        formData.lastName.trim(),
        searchParams.get('affiliate_id')
      );

      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper bg-light" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', padding: '40px 0' }}>
      <SEO title="Register | Electronic Components Search" />

      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={5}>
            <div className="text-center mb-4">
              <h2 className="fw-bold">Create Account</h2>
              <p className="text-muted small">Join our network of electronic component suppliers and buyers</p>
            </div>

            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4 p-md-5">
                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                {success && <Alert variant="success" className="py-2 small">Success! Redirecting...</Alert>}

                <Form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">EMAIL ADDRESS</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FontAwesomeIcon icon={faEnvelope} className="text-primary" />
                      </span>
                      <Form.Control
                        className="border-start-0"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@company.com"
                        required
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">FIRST NAME</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">LAST NAME</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Password Field */}
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted">PASSWORD</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FontAwesomeIcon icon={faLock} className="text-primary" />
                      </span>
                      <Form.Control
                        className="border-start-0"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2 fw-bold"
                    disabled={loading}
                  >
                    {loading ? <Spinner animation="border" size="sm" /> : (
                      <>
                        <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <p className="small mb-0 text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="fw-bold text-decoration-none">
                      Log in here
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;