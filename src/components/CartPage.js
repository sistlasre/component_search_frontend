import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, Button, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faShoppingCart, faArrowRight, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [editQuantities, setEditQuantities] = useState({});

  // Sync local edit state when cartItems change (e.g. after a delete)
  useEffect(() => {
    setEditQuantities((prev) => {
      const next = {};
      cartItems.forEach((item) => {
        next[item.partNumber] = prev[item.partNumber] ?? item.quantity;
      });
      return next;
    });
  }, [cartItems]);

  const handleQuantityChange = (partNumber, value) => {
    setEditQuantities((prev) => ({ ...prev, [partNumber]: Math.max(1, parseInt(value) || 1) }));
  };

  const applyQuantity = (partNumber) => {
    updateQuantity(partNumber, editQuantities[partNumber]);
  };

  const discardQuantity = (partNumber) => {
    const original = cartItems.find((i) => i.partNumber === partNumber)?.quantity;
    setEditQuantities((prev) => ({ ...prev, [partNumber]: original }));
  };

  const isChanged = (partNumber) => {
    return editQuantities[partNumber] !== undefined
      && editQuantities[partNumber] !== cartItems.find((i) => i.partNumber === partNumber)?.quantity;
  };

  if (cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <FontAwesomeIcon icon={faShoppingCart} size="3x" className="text-muted mb-3" />
        <h3 className="mb-3">Your cart is empty</h3>
        <p className="text-muted mb-4">Browse our catalog and add parts to your cart.</p>
        <Button as={Link} to="/" variant="primary">
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4" style={{ fontWeight: 400 }}>Shopping Cart</h2>

      <Table responsive bordered hover className="cart-table align-middle">
        <thead className="bg-light">
          <tr>
            <th>Part Number</th>
            <th>Manufacturer</th>
            <th style={{ width: '200px' }}>Quantity</th>
            <th style={{ width: '80px' }} className="text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item.partNumber}>
              <td>
                <Link to={`/part/${encodeURIComponent(item.partNumber)}`} className="fw-semibold">
                  {item.partNumber}
                </Link>
              </td>
              <td>{item.manufacturer}</td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="number"
                    min="1"
                    value={editQuantities[item.partNumber] ?? item.quantity}
                    onChange={(e) => handleQuantityChange(item.partNumber, e.target.value)}
                    size="sm"
                    style={{ maxWidth: '100px' }}
                  />
                  <Button
                    variant={isChanged(item.partNumber) ? 'success' : 'outline-secondary'}
                    size="sm"
                    disabled={!isChanged(item.partNumber)}
                    onClick={() => applyQuantity(item.partNumber)}
                    title="Apply quantity"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={!isChanged(item.partNumber)}
                    onClick={() => discardQuantity(item.partNumber)}
                    title="Discard change"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                </div>
              </td>
              <td className="text-center">
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeFromCart(item.partNumber)}
                  title="Remove from cart"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <Button as={Link} to="/" variant="outline-secondary">
          Continue Shopping
        </Button>
        <Button as={Link} to="/checkout" variant="primary" size="lg" className="fw-bold">
          Proceed to Checkout <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
        </Button>
      </div>
    </Container>
  );
};

export default CartPage;
