import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="py-4">
          <Col lg={4} md={6} className="mb-4 mb-lg-0">
            <h5 className="text-white mb-3">About ComponentSearch</h5>
            <p className="text-muted small">
              Your trusted source for electronic components. We connect buyers with verified suppliers worldwide, 
              offering real-time inventory and competitive pricing.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#facebook" className="text-muted">
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </a>
              <a href="#twitter" className="text-muted">
                <FontAwesomeIcon icon={faTwitter} size="lg" />
              </a>
              <a href="#linkedin" className="text-muted">
                <FontAwesomeIcon icon={faLinkedin} size="lg" />
              </a>
              <a href="#youtube" className="text-muted">
                <FontAwesomeIcon icon={faYoutube} size="lg" />
              </a>
            </div>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-lg-0">
            <h6 className="text-white mb-3">Quick Links</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#products">All Products</a></li>
              <li className="mb-2"><a href="#manufacturers">Manufacturers</a></li>
              <li className="mb-2"><a href="#new-products">New Products</a></li>
              <li className="mb-2"><a href="#hot-offers">Hot Offers</a></li>
              <li className="mb-2"><a href="#rfq">Request Quote</a></li>
            </ul>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-lg-0">
            <h6 className="text-white mb-3">Categories</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#semiconductors">Semiconductors</a></li>
              <li className="mb-2"><a href="#passives">Passive Components</a></li>
              <li className="mb-2"><a href="#connectors">Connectors</a></li>
              <li className="mb-2"><a href="#sensors">Sensors</a></li>
              <li className="mb-2"><a href="#power">Power Solutions</a></li>
            </ul>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-lg-0">
            <h6 className="text-white mb-3">Support</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#help">Help Center</a></li>
              <li className="mb-2"><a href="#shipping">Shipping Info</a></li>
              <li className="mb-2"><a href="#returns">Returns</a></li>
              <li className="mb-2"><a href="#terms">Terms of Service</a></li>
              <li className="mb-2"><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </Col>
          
          <Col lg={2} md={12}>
            <h6 className="text-white mb-3">Contact Us</h6>
            <ul className="list-unstyled small">
              <li className="mb-2 d-flex align-items-center">
                <FontAwesomeIcon icon={faPhone} className="me-2" style={{ width: '16px' }} />
                <span>1-800-PARTS</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" style={{ width: '16px' }} />
                <span>sales@componentsearch.com</span>
              </li>
              <li className="mb-2 d-flex align-items-start">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 mt-1" style={{ width: '16px' }} />
                <span>123 Tech Drive<br />San Jose, CA 95110</span>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="border-secondary" />
        
        <Row className="py-3">
          <Col className="text-center text-muted small">
            <p className="mb-0">
              © 2025 ComponentSearch. All rights reserved. | ISO 9001:2015 Certified
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;