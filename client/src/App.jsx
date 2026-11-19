import { Route, Routes, Link, Outlet } from "react-router-dom";
import { ArrowUpRight, Instagram } from "lucide-react";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Resources from "./pages/Resources.jsx";
import ResourceDetail from "./pages/ResourceDetail.jsx";
import Admin from "./pages/Admin.jsx";

function Footer() {
  return <footer className="site-footer"><div className="footer-main"><Link className="brand" to="/"><span className="brand-mark">T</span><span>TECHSLOT<span className="brand-dot">.</span></span></Link><p>Useful things for your next big idea.</p><a className="social-link" href="https://www.instagram.com/techslot_dev/" target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram <ArrowUpRight size={14} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} TECHSLOT</span><span>Made for people who make things.</span></div></footer>;
}

function SiteLayout() {
  return <><Header /><Outlet /><Footer /></>;
}

function NotFound() {
  return <main className="page-shell"><div className="empty-state"><span className="eyebrow">404 · Page not found</span><h1>Nothing here<span className="accent">.</span></h1><Link className="button secondary" to="/">Back home</Link></div></main>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="resources" element={<Resources />} />
        <Route path="resources/:slug" element={<ResourceDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
