import React from "react";
import { Container, Row, Col, Form, Button, Nav, Navbar } from "react-bootstrap";
import {
  Upload,
  ArrowRight,
  Phone,
  FileSpreadsheet,
  CheckCircle2,
  Truck,
  BarChart3,
  Megaphone,
  Eye,
  Handshake,
  DollarSign,
  CalendarDays,
  Recycle,
  PackageCheck,
  RotateCcw,
} from "lucide-react";

// Brand Color Palette
const BLUE = "#0074D9";
const DARK = "#07111f";
const GREEN = "#27c14a";

export default function ExcessPage() {
  return (
    <div className="bg-white text-dark min-vh-screen">
      <Hero />
      <Partnership />
      <Consignment />
      <EWasteScrap />
      <FinalCTA />
    </div>
  );
}

function Header() {
  return (
    <Navbar bg="white" expand="lg" className="border-bottom border-light sticky-top py-3">
      <Container>
        <Navbar.Brand href="/" className="d-flex align-items-center me-4">
          <img
            src="https://www.componentsearch.com/logo_blue_small.webp"
            alt="Component Search"
            style={{ height: "36px", width: "auto" }}
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto gap-lg-4 my-2 my-lg-0">
            <Nav.Link href="/excess" className="fw-bold text-primary">Excess</Nav.Link>
            <Nav.Link href="/consignment" className="fw-semibold text-secondary">Consignment</Nav.Link>
            <Nav.Link href="/ewaste-scrap" className="fw-semibold text-secondary">E-Waste / Scrap</Nav.Link>
            <Nav.Link href="/about-us" className="fw-semibold text-secondary">About Us</Nav.Link>
            <Nav.Link href="/resource-center" className="fw-semibold text-secondary">Resources</Nav.Link>
            <Nav.Link href="/contact" className="fw-semibold text-secondary">Contact</Nav.Link>
          </Nav>

          <Button
            href="#quote"
            className="fw-bold border-0 px-4 py-2"
            style={{ backgroundColor: BLUE }}
          >
            Get a Quote
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function Hero() {
  return (
    <section
      className="text-white position-relative overflow-hidden py-5 py-lg-5"
      style={{
        backgroundColor: DARK,
        backgroundImage: `
          radial-gradient(circle at 10% 10%, rgba(0, 116, 217, 0.25) 0, transparent 40%),
          radial-gradient(circle at 80% 20%, rgba(0, 116, 217, 0.2) 0, transparent 35%)
        `
      }}
    >
      <Container className="position-relative py-4">
        <Row className="align-items-start gy-5">
          {/* Main Hero Context */}
          <Col lg={7} xl={8} className="text-center text-lg-start">
            <p className="text-uppercase fw-bold tracking-wider text-info mb-3" style={{ letterSpacing: "2px", fontSize: "0.85rem" }}>
              Excess Inventory Solutions
            </p>

            <h1 className="fw-black text-uppercase lh-1 mb-4 display-4 font-weight-black" style={{ fontWeight: 900 }}>
              Get More For Your
              <div className="d-block mt-3 fs-2 fs-md-1 fw-bold text-capitalize" style={{ letterSpacing: "normal" }}>
                <span className="text-white">Excess</span>
                <span className="mx-2 text-white-50">|</span>
                <span style={{ color: GREEN }}>E-Waste</span>
                <span className="mx-2 text-white-50">|</span>
                <span style={{ color: BLUE }}>Scrap</span>
              </div>
            </h1>

            <p className="fs-4 fw-bold text-uppercase text-light mt-4 mb-2">
              Get an instant quote now
            </p>
            <p className="text-white-700 fs-5 mb-4 max-w-2xl mx-auto mx-lg-0">
              Submit your list and let Component Search return the offer
            </p>

            <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3 mt-4">
              <Button
                href="#quote"
                className="d-inline-flex align-items-center justify-content-center gap-2 fw-bold border-0 px-4 py-3 shadow-sm"
                style={{ backgroundColor: BLUE }}
              >
                Get Your Cash Offer <ArrowRight size={20} />
              </Button>
              <Button
                href="/contact"
                variant="outline-light"
                className="d-inline-flex align-items-center justify-content-center gap-2 fw-bold px-4 py-3"
                style={{ borderColor: "rgba(255,255,255,0.25)" }}
              >
                Schedule a Call <CalendarDays size={20} />
              </Button>
            </div>

            {/* Bottom Hero Matrix points */}
            <Row className="mt-5 pt-4 border-top border-secondary gy-4 text-start">
              <Col sm={4}>
                <HeroPoint icon={<CheckCircle2 />} title="Transparent Process" text="Clear visibility from list review to offer." />
              </Col>
              <Col sm={4}>
                <HeroPoint icon={<DollarSign />} title="Competitive Offers" text="We intend to pay more." />
              </Col>
              <Col sm={4}>
                <HeroPoint icon={<Handshake />} title="Flexible Options" text="Buyout or consignment." />
              </Col>
            </Row>
          </Col>

          {/* Form Content Side */}
          <Col lg={5} xl={4}>
            <QuoteForm />
          </Col>
        </Row>
      </Container>
    </section>
  );
}

function QuoteForm() {
  return (
    <aside
      id="quote"
      className="bg-white text-dark rounded-3 p-4 p-md-4 shadow-lg border border-light"
    >
      <h2 className="fs-4 fw-black text-uppercase tracking-tight mb-4" style={{ fontWeight: 900 }}>
        Submit Your Inventory
      </h2>

      <Form onSubmit={(e) => e.preventDefault()} className="d-flex flex-column gap-3">
        <Row className="g-3">
          <Col sm={6}>
            <Input label="First Name" placeholder="First name" id="firstName" />
          </Col>
          <Col sm={6}>
            <Input label="Last Name" placeholder="Last name" id="lastName" />
          </Col>
        </Row>

        <Input label="Company" placeholder="Your company" id="company" />

        <Row className="g-3">
          <Col sm={6}>
            <Input label="Email" placeholder="name@company.com" type="email" id="email" />
          </Col>
          <Col sm={6}>
            <Input label="Phone" placeholder="714-332-1337" type="tel" id="phone" />
          </Col>
        </Row>

        {/* Upload Container Zone */}
        <div
          className="rounded-3 border border-2 border-dashed bg-light p-4 text-center my-2"
          style={{ borderColor: "#dee2e6", cursor: "pointer" }}
        >
          <FileSpreadsheet className="text-muted mb-2" size={32} />
          <p className="fw-bold mb-1 text-secondary">Upload inventory list</p>
          <p className="text-muted small mb-0">Excel, CSV, or PDF</p>
        </div>

        <Button
          type="submit"
          className="w-full d-flex align-items-center justify-content-center gap-2 fw-bold border-0 py-3 mt-2"
          style={{ backgroundColor: BLUE }}
        >
          Get Your Cash Offer <ArrowRight size={18} />
        </Button>
      </Form>
    </aside>
  );
}

function Partnership() {
  return (
    <section className="bg-light px-3 py-5 border-bottom border-light">
      <Container className="py-4">
        <div className="text-center max-w-3xl mx-auto mb-5">
          <p className="text-uppercase fw-bold mb-2 small tracking-wider" style={{ color: BLUE, letterSpacing: "1.5px" }}>
            Why choose Component Search
          </p>
          <h2 className="fw-black tracking-tight display-6" style={{ fontWeight: 800 }}>
            Exclusive Excess Partnership
          </h2>
          <p className="text-muted fs-5 mt-3 max-w-2xl mx-auto">
            More than a buyer. We help position, market, and move your excess inventory with transparency.
          </p>
        </div>

        <Row className="g-4 mt-2">
          <Col md={4}>
            <Card icon={<Eye />} title="Full Transparency" text="Clear communication, open pricing, and visibility into how your inventory is being worked." />
          </Col>
          <Col md={4}>
            <Card icon={<BarChart3 />} title="Market Based Analysis" text="We evaluate supply, pricing, demand, and market position before making a recommendation." />
          </Col>
          <Col md={4}>
            <Card icon={<Megaphone />} title="Advertising Advantages" text="Your inventory can benefit from active digital exposure and buyer-focused marketing." />
          </Col>
        </Row>
      </Container>
    </section>
  );
}

function Consignment() {
  return (
    <section className="bg-white px-3 py-5">
      <Container className="py-4">
        <div className="text-center max-w-3xl mx-auto mb-5">
          <p className="text-uppercase fw-bold mb-2 small tracking-wider" style={{ color: BLUE, letterSpacing: "1.5px" }}>
            Flexible solutions
          </p>
          <h2 className="fw-black display-6" style={{ fontWeight: 800 }}>Consignment</h2>
          <p className="text-muted fs-5 mt-3">
            When consignment is the better path, we make it simple.
          </p>
        </div>

        {/* Logistics alert callout banner */}
        <div
          className="mx-auto rounded-3 p-4 mb-5 border d-flex flex-column flex-sm-row align-items-center gap-4 max-w-3xl"
          style={{ backgroundColor: "rgba(0, 116, 217, 0.05)", borderColor: "rgba(0, 116, 217, 0.15)" }}
        >
          <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "60px", height: "60px", flexShrink: 0 }}>
            <Truck size={30} style={{ color: BLUE }} />
          </div>
          <div className="text-center text-sm-start">
            <h3 className="h4 fw-black uppercase mb-1" style={{ color: BLUE, fontWeight: 800 }}>
              We Pay Logistics Costs
            </h3>
            <p className="text-muted mb-0">We handle the logistics so you keep more of the return.</p>
          </div>
        </div>

        <Row className="g-3">
          <Col sm={6} lg={3}>
            <Mini title="Logistics Covered" text="We arrange and pay for shipping to our facility." />
          </Col>
          <Col sm={6} lg={3}>
            <Mini title="Structured Intake" text="Inventory is received, documented, and organized." />
          </Col>
          <Col sm={6} lg={3}>
            <Mini title="Buyer Exposure" text="Your list can be marketed to active component buyers." />
          </Col>
          <Col sm={6} lg={3}>
            <Mini title="Higher Return Potential" text="Consignment can make sense for slow-moving inventory." />
          </Col>
        </Row>
      </Container>
    </section>
  );
}

function EWasteScrap() {
  return (
    <section className="bg-light px-3 py-5 border-top border-light">
      <Container className="py-4">
        <div className="text-center max-w-3xl mx-auto mb-5">
          <p className="text-uppercase fw-bold mb-2 small tracking-wider" style={{ color: GREEN, letterSpacing: "1.5px" }}>
            E-Waste / Scrap Recovery
          </p>
          <h2 className="fw-black display-6" style={{ fontWeight: 800 }}>
            E-Waste / Scrap
          </h2>
          <p className="text-muted fs-5 mt-3">
            For obsolete, mixed, damaged, or board-level material, Component Search can help recover value beyond standard scrap pricing.
          </p>
        </div>

        <div
          className="mx-auto text-center rounded-3 p-4 mb-5 border max-w-3xl"
          style={{ backgroundColor: "rgba(39, 193, 74, 0.05)", borderColor: "rgba(39, 193, 74, 0.2)" }}
        >
          <h3 className="h4 fw-black text-uppercase mb-2" style={{ color: GREEN, fontWeight: 800 }}>
            We Pay Higher Than Scrap Prices
          </h3>
          <p className="text-muted mb-0">
            We evaluate recoverable component value, not just raw material weight.
          </p>
        </div>

        <Row className="g-4">
          <Col md={4}>
            <FeatureMini icon={<Recycle />} color={GREEN} title="Component Reclaiming" text="We can remove and refurbish usable components in house." />
          </Col>
          <Col md={4}>
            <FeatureMini icon={<PackageCheck />} color={GREEN} title="Mixed Material Accepted" text="Boards, trays, reels, tubes, partials, and obsolete inventory can be reviewed." />
          </Col>
          <Col md={4}>
            <FeatureMini icon={<RotateCcw />} color={GREEN} title="Outright Buy or Revenue Split" text="We can offer a direct purchase or structure a recovery-based split." />
          </Col>
        </Row>
      </Container>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="text-white py-5" style={{ backgroundColor: DARK }}>
      <Container className="py-4">
        <div
          className="rounded-3 p-4 p-md-5 border d-flex flex-column flex-lg-row align-items-lg-center justify-content-lg-between gap-4"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.02)", borderColor: "rgba(255, 255, 255, 0.1)" }}
        >
          <div>
            <h2 className="h2 fw-black tracking-tight mb-2" style={{ fontWeight: 800 }}>Send Your Inventory List Now</h2>
            <p className="text-white-50 mb-0">Get your cash offer today.</p>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2" style={{ flexShrink: 0 }}>
            <Button
              href="#quote"
              className="d-inline-flex align-items-center justify-content-center gap-2 fw-bold border-0 px-4 py-3"
              style={{ backgroundColor: BLUE }}
            >
              Upload List <Upload size={18} />
            </Button>
            <Button
              href="/contact"
              variant="outline-light"
              className="d-inline-flex align-items-center justify-content-center gap-2 fw-bold px-4 py-3"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
            >
              Schedule a Call <CalendarDays size={18} />
            </Button>
            <Button
              href="tel:7143321337"
              variant="outline-light"
              className="d-inline-flex align-items-center justify-content-center gap-2 fw-bold px-4 py-3"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
            >
              Call Us <Phone size={18} />
            </Button>
          </div>
        </div>

        {/* Global Footer Sub-Block */}
        <footer className="mt-5 pt-5 border-top d-flex flex-column flex-md-row justify-content-between gap-4 text-muted small" style={{ borderColor: "rgba(255, 255, 255, 0.1) !important" }}>
          <div>
            <img
              src="https://www.componentsearch.com/logo_white_small.webp"
              alt="Component Search"
              style={{ height: "32px", width: "auto" }}
              className="mb-3"
            />
            <p className="mb-0 text-white-50">componentsearch.com</p>
          </div>
          <div className="text-md-end text-white-50">
            <p className="mb-1 fw-semibold text-light">brandon@componentsearch.com</p>
            <p className="mb-0">714-332-1337</p>
          </div>
        </footer>
      </Container>
    </section>
  );
}

/* Helper Presentational Subcomponents mapping cleanly to Bootstrap HTML utility standards */
function Input({ label, placeholder, type = "text", id }) {
  return (
    <Form.Group controlId={id} className="text-start">
      <Form.Label className="small fw-bold text-secondary mb-1">{label}</Form.Label>
      <Form.Control
        type={type}
        placeholder={placeholder}
        className="py-2"
        style={{ fontSize: "0.9rem" }}
      />
    </Form.Group>
  );
}

function HeroPoint({ icon, title, text }) {
  return (
    <div className="ps-3 border-start border-secondary h-100">
      <div className="d-flex align-items-center gap-2 mb-2">
        <span style={{ color: BLUE, display: "inline-flex" }}>
          {React.cloneElement(icon, { size: 18 })}
        </span>
        <h3 className="text-uppercase small fw-bold tracking-wide mb-0 text-light">{title}</h3>
      </div>
      <p className="small text-white-50 mb-0 leading-normal" style={{ fontSize: "0.825rem" }}>{text}</p>
    </div>
  );
}

function Card({ icon, title, text }) {
  return (
    <div className="card h-100 rounded-3 border-light shadow-sm p-4 text-center bg-white">
      <div
        className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-3"
        style={{ color: BLUE, backgroundColor: "rgba(0, 116, 217, 0.06)", width: "52px", height: "52px" }}
      >
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <h3 className="h5 fw-bold text-dark mb-2">{title}</h3>
      <p className="text-muted small mb-0 lh-base">{text}</p>
    </div>
  );
}

function Mini({ title, text }) {
  return (
    <div className="card h-100 rounded-3 border-light shadow-sm p-4 text-center bg-white">
      <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ backgroundColor: "rgba(0, 116, 217, 0.05)", width: "40px", height: "40px" }}>
        <CheckCircle2 size={20} style={{ color: BLUE }} />
      </div>
      <h3 className="h6 fw-bold text-dark mb-2">{title}</h3>
      <p className="text-muted small mb-0 variant-body">{text}</p>
    </div>
  );
}

function FeatureMini({ icon, color, title, text }) {
  return (
    <div className="card h-100 rounded-3 border-light shadow-sm p-4 text-center bg-white">
      <div
        className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-3"
        style={{ color: color, backgroundColor: "rgba(39, 193, 74, 0.06)", width: "48px", height: "48px" }}
      >
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <h3 className="h5 fw-bold text-dark mb-2">{title}</h3>
      <p className="text-muted small mb-0 lh-base">{text}</p>
    </div>
  );
}