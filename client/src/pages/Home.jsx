import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Boxes, Braces, Code2, FileText, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api.js";
import ResourceGrid from "../components/ResourceGrid.jsx";

const categoryIcons = {
  "pdfs-notes": FileText,
  "react-components": Braces,
  "ai-prompts": WandSparkles,
  "developer-tools": Boxes,
};

export default function Home() {
  const [latest, setLatest] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([api.get("/resources/latest"), api.get("/resources/featured"), api.get("/resources/popular"), api.get("/categories")])
      .then(([newest, selected, mostPopular, categoryResponse]) => {
        setLatest(newest.data.resources);
        setFeatured(selected.data.resources);
        setPopular(mostPopular.data.resources);
        setCategories(categoryResponse.data.categories);
      })
      .catch((reason) => setError(reason.response?.data?.message || "Resources could not be loaded. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <span className="eyebrow"><span className="pulse-dot" /> A curated library for curious minds</span>
          <h1>Resources<br />for <span>builders.</span></h1>
          <p>Good things to make good things with. Explore practical tools, notes, components, and ideas from TECHSLOT.</p>
          <div className="hero-actions"><Link className="button primary" to="/resources">Explore resources <ArrowUpRight size={17} /></Link><a className="text-link" href="#latest">See what’s new <ArrowDown size={15} /></a></div>
          <div className="hero-note"><Code2 size={15} /> Built for the next thing you’re building</div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="art-card art-card-back"><span>01 / BUILD</span><div className="art-lines"><i /><i /><i /></div><div className="art-code">const idea = "ship it";</div></div>
          <div className="art-card art-card-front"><div className="art-card-top"><span className="window-dots">● ● ●</span><span>techslot.dev</span></div><div className="art-symbol">{"{ }"}</div><div className="art-title">Make something<br /><em>remarkable.</em></div><div className="art-chip">CREATIVE TOOLKIT <ArrowUpRight size={13} /></div></div>
          <div className="floating-tag"><span className="tag-icon"><WandSparkles size={15} /></span> Thoughtfully selected</div>
        </div>
        <div className="hero-bottom"><span>01 — A RESOURCE HUB FOR BUILDERS</span><span>SCROLL TO EXPLORE ↓</span></div>
      </section>

      <section className="section-wrap" id="latest">
        <div className="section-heading"><div><span className="eyebrow">Fresh off the shelf</span><h2>Latest resources<span className="accent">.</span></h2></div><Link className="arrow-link" to="/resources">View all <ArrowRight size={16} /></Link></div>
        {error && <div className="notice error">{error}</div>}
        <ResourceGrid resources={latest} loading={loading} empty="New resources will show up here." />
      </section>

      <section className="category-section">
        <div className="section-wrap">
          <div className="section-heading"><div><span className="eyebrow">Find your next spark</span><h2>Browse by category<span className="accent">.</span></h2></div></div>
          <div className="category-grid">{categories.map((category, index) => {
            const Icon = categoryIcons[category.slug] || Code2;
            return <Link className="category-tile" key={category._id} to={`/resources?category=${category._id}`}><span className="category-number">{String(index + 1).padStart(2, "0")}</span><span className="category-icon"><Icon size={21} /></span><span className="category-name">{category.name}</span><ArrowUpRight className="category-arrow" size={17} /></Link>;
          })}</div>
        </div>
      </section>

      {featured.length > 0 && <section className="section-wrap featured-section"><div className="section-heading"><div><span className="eyebrow">Worth a closer look</span><h2>Hand-picked<span className="accent">.</span></h2></div></div><ResourceGrid resources={featured} /></section>}
      {popular.length > 0 && <section className="section-wrap featured-section"><div className="section-heading"><div><span className="eyebrow">Loved by the community</span><h2>Popular resources<span className="accent">.</span></h2></div></div><ResourceGrid resources={popular} /></section>}
    </>
  );
}
