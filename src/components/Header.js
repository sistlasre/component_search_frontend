import React from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMicrochip, faShoppingCart, faUser, faSignOutAlt, faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const { cartCount } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <a target="_blank" rel="noopener noreferrer" href="/certs/component_search_as9120_iso9001.pdf">
          <img src="/certs/nqa-as9120.jpg" alt="AS 9120 Certification" height="50" className="d-inline-block align-top me-2" />
        </a>
        <a target="_blank" rel="noopener noreferrer" href="/certs/component_search_as9120_iso9001.pdf">
          <img src="/certs/nqa-iso9001.jpg" alt="ISO 9001 Certification" height="50" className="d-inline-block align-top me-2" />
        </a>
        <a target="_blank" rel="noopener noreferrer" href="/certs/component_search_as6081.pdf">
          <img src="/certs/nqa-as6081.jpg" alt="AS 6081 Certification" height="50" className="d-inline-block align-top me-2" />
        </a>
        <a href="#">
          <img src="/certs/itar.png" alt="ITAR Certification" height="50" className="d-inline-block align-top me-2" />
        </a>
        <a href="#">
          <img src="/certs/gidep.png" alt="GIDEP Certification" height="50" className="d-inline-block align-top me-2" />
        </a>
        
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          {/* Desktop Search Bar */}
          <Form className="d-none d-lg-flex mx-auto" style={{ width: '40%' }} onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="Search by part number"
              className="me-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" variant="primary">
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </Form>
          {/* Cart Icon */}
          <Nav className="ms-auto">
            {user ? (
              <>
                <Navbar.Text className="me-3 text-dark">
                  <Link to="/account" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <FontAwesomeIcon icon={faUser} className="me-1" />
                    {user.username || user.user_id}
                  </Link>
                </Navbar.Text>
                <Nav.Link as={Link} to="/orders" className="text-dark me-2" title="My Orders & Requests">
                  <FontAwesomeIcon icon={faFileInvoice} className="me-1" />
                  Orders
                </Nav.Link>
                <Button variant="outline-primary" size="sm" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-dark">Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="text-dark">Register</Nav.Link>
              </>
            )}
            <Nav.Link as={Link} to="/cart" className="position-relative px-3">
              <FontAwesomeIcon icon={faShoppingCart} size="lg" style={{ color: '#1a56db' }} />
              {cartCount > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="cart-badge"
                >
                  {cartCount}
                </Badge>
              )}
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