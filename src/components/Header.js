import React from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMicrochip, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  // Custom gradient style
  const navbarStyle = {
    background: 'linear-gradient(140deg, #60a5fa 0%, #dbeafe 100%)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)', // Subtle blue-tinted shadow
    borderBottom: '1px solid #bfdbfe'
  };

  return (
    <Navbar variant="dark" expand="lg" className="shadow-sm sticky-top" style={navbarStyle}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center text-primary-tint">
          <img
            src="/logo_white_small.webp"
            alt="ComponentSearch Logo"
            height="50"
            width="125"
            className="d-inline-block align-top me-2"
          />
        </Navbar.Brand>
        <img
          src="/as9120-color.png"
          alt="AS 9120 Certification Logo"
          height="50"
          className="d-inline-block align-top me-2"
        />
        <img
          src="/ISO_9001-2015.png"
          alt="ISO 9001 Certification"
          height="50"
          className="d-inline-block align-top me-2"
        />
        <img
          src="/nqa-as6081.png"
          alt="nqa AS6081 Certification"
          height="50"
          className="d-inline-block align-top me-2"
        />
        
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          {/* Desktop Search Bar */}
          <Form className="d-none d-lg-flex mx-auto" style={{ width: '40%' }} onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="Search by part number, keyword, or description..."
              className="me-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" variant="primary">
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </Form>
          {/* 3. The Spacer: This replaces your old Nav */}
          <div className="d-none d-lg-flex ms-auto" style={{ visibility: 'hidden', width: 'auto' }}>
             {/* This invisible div balances the Brand's width on the left */}
             <div style={{ width: '150px' }}></div>
          </div>

          {/* Mobile Search Bar */}
          <Form className="d-lg-none mt-3" onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="Search parts..."
              className="mb-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" variant="primary" className="w-100">
              <FontAwesomeIcon icon={faSearch} className="me-2" />
              Search
            </Button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;