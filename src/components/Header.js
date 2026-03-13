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

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm border-bottom sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center text-primary-tint">
          <FontAwesomeIcon icon={faMicrochip} className="me-2" size="lg" />
          <span>ComponentSearch</span>
        </Navbar.Brand>
        
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