import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faShoppingCart, faArrowRight, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useCart, computeUnitPriceForQty } from '../context/CartContext';

const formatCurrency = (amount) =>
  `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;

// Effective unit price for an item at a given qty. If price_breaks are
// present we always recompute off them so the displayed subtotal matches
// what would be charged. Falls back to whatever unit_price is stored on the
// item (e.g. set on Part Detail) when no price_breaks are available.
const effectiveUnitPrice = (item, qty) => {
  const recomputed = computeUnitPriceForQty(item.price_breaks, qty);
  if (recomputed != null) return recomputed;
  if (item.unit_price != null && Number.isFinite(Number(item.unit_price))) {
    return Number(item.unit_price);
  }
  return null;
};

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
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

  // Running total across all items where we have enough info to price them.
  // Items without unit pricing (e.g. request-style inquiries) contribute 0.
  const grandTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = effectiveUnitPrice(item, item.quantity);
      if (price == null) return sum;
      return sum + price * Number(item.quantity || 0);
    }, 0);
  }, [cartItems]);

  const hasAnyPricing = cartItems.some((i) => effectiveUnitPrice(i, i.quantity) != null);

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
            <th className="text-end" style={{ width: '120px' }}>Unit Price</th>
            <th className="text-end" style={{ width: '140px' }}>Subtotal</th>
            <th style={{ width: '80px' }} className="text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => {
            // Preview pricing against the pending edit so admins see the
            // price_break that *would* apply if they commit the change.
            const previewQty = editQuantities[item.partNumber] ?? item.quantity;
            const previewUnit = effectiveUnitPrice(item, previewQty);
            const previewSubtotal = previewUnit != null ? previewUnit * Number(previewQty || 0) : null;
            return (
              <tr key={item.partNumber}>
                <td>
                  <Link to={`/part/${encodeURIComponent(item.partNumber)}`} className="fw-semibold part-number">
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
                <td className="text-end">
                  {previewUnit != null ? formatCurrency(previewUnit) : <span className="text-muted">—</span>}
                </td>
                <td className="text-end">
                  {previewSubtotal != null ? formatCurrency(previewSubtotal) : <span className="text-muted">—</span>}
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
            );
          })}
        </tbody>
        {hasAnyPricing && (
          <tfoot>
            <tr>
              <td colSpan={4} className="text-end fw-bold">Total</td>
              <td className="text-end fw-bold">{formatCurrency(grandTotal)}</td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <div className="d-flex gap-2">
          <Button as={Link} to="/" variant="outline-secondary">
            Continue Shopping
          </Button>
          <Button variant="outline-danger" onClick={clearCart}>
            <FontAwesomeIcon icon={faTrash} className="me-2" />Clear Cart
          </Button>
        </div>
        <Button as={Link} to="/checkout" variant="primary" size="lg" className="fw-bold">
          Proceed to Checkout <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
        </Button>
      </div>
    </Container>
  );
};

export default CartPage;
