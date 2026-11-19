import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="TECHSLOT Resource Hub home">
          <span className="brand-mark">T</span>
          <span className="brand-name"><span>TECHSLOT<span className="brand-dot">.</span></span><small>Resource Hub</small></span>
        </Link>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={open ? "main-nav open" : "main-nav"}>
          <NavLink to="/resources" onClick={closeMenu}>Explore</NavLink>
          <a href="https://www.instagram.com/techslot_dev/" target="_blank" rel="noreferrer" onClick={closeMenu}>Instagram <ArrowUpRight size={14} /></a>
          <Link className="nav-cta" to="/resources" onClick={closeMenu}>Browse resources <ArrowUpRight size={15} /></Link>
        </nav>
      </div>
    </header>
  );
}
