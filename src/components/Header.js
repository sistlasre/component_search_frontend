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

          <Nav className="ms-auto align-items-center">
            <Nav.Link href="#products" className="d-flex align-items-center">
              <span className="d-none d-md-inline">Products</span>
              <span className="d-md-none">Products</span>
            </Nav.Link>
            <Nav.Link href="#manufacturers">
              <span className="d-none d-md-inline">Manufacturers</span>
              <span className="d-md-none">Brands</span>
            </Nav.Link>
            <Nav.Link href="#resources">Resources</Nav.Link>
            <Nav.Link href="#cart" className="position-relative">
              <FontAwesomeIcon icon={faShoppingCart} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                3
              </span>
            </Nav.Link>
            <Nav.Link href="#account">
              <FontAwesomeIcon icon={faUser} />
            </Nav.Link>
          </Nav>

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