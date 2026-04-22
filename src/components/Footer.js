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
              <li className="mb-2"><a href="#about-us">About Us</a></li>
              <li className="mb-2"><a href="#excess">Excess</a></li>
              <li className="mb-2"><a href="#e-waste">E-waste/scrap</a></li>
              <li className="mb-2"><a href="#consignment">Consignment</a></li>
              <li className="mb-2"><a href="#scheduled-orders">Scheduled Orders</a></li>
            </ul>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-lg-0">
            <h6 className="text-white mb-3">Categories</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="/category/Integrated%20Circuits%20(ICs)">Integrated Circuits</a></li>
              <li className="mb-2"><a href="/category/Resistors">Resistors</a></li>
              <li className="mb-2"><a href="/category/Capacitors">Capacitors</a></li>
              <li className="mb-2"><a href="/category/Connectors%2C%20Interconnects">Connectors</a></li>
              <li className="mb-2"><a href="/category/Discrete%20Semiconductor%20Products">Semiconductors</a></li>
            </ul>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-lg-0">
            <h6 className="text-white mb-3">Support</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#help-center">Help Center</a></li>
              <li className="mb-2"><a href="#quality-policy">Quality Policy</a></li>
              <li className="mb-2"><a href="#terms-of-service">Terms of Service</a></li>
              <li className="mb-2"><a href="#privacy-policy">Privacy Policy</a></li>
              <li className="mb-2"><a href="#cookies-and-gdpr">Cookies/GDPR Policy</a></li>
            </ul>
          </Col>
          
          <Col lg={2} md={12}>
            <h6 className="text-white mb-3">Contact Us</h6>
            <ul className="list-unstyled small">
              <li className="mb-2 d-flex align-items-center">
                <FontAwesomeIcon icon={faPhone} className="me-2" style={{ width: '16px' }} />
                <span>(800) 974-9947</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" style={{ width: '16px' }} />
                <span>sales@componentsearch.com</span>
              </li>
              <li className="mb-2 d-flex align-items-start">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 mt-1" style={{ width: '16px' }} />
                <span>2856 E Imperial Hwy<br />Brea, CA 92821</span>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="border-secondary" />
        
        <Row className="py-3">
          <Col className="text-center text-muted small">
            <p className="mb-0">
              © 2026 ComponentSearch. All rights reserved. | ISO 9001:2015 Certified
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;