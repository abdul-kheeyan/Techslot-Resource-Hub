import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import api from "../api.js";
import ResourceGrid from "../components/ResourceGrid.jsx";

const types = ["PDF", "File", "Prompt", "Component", "External Link", "Tool"];

export default function Resources() {
  const [params, setParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const search = params.get("q") || "";
  const type = params.get("type") || "";
  const category = params.get("category") || "";

  useEffect(() => { api.get("/categories").then(({ data }) => setCategories(data.categories)).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    setError("");
    api.get("/resources", { params: Object.fromEntries(params.entries()) })
      .then(({ data }) => { setResources(data.resources); setPagination(data.pagination); })
      .catch((reason) => { setResources([]); setError(reason.response?.data?.message || "Resources could not be loaded. Please try again."); })
      .finally(() => setLoading(false));
  }, [params]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    setParams(next);
  };
  const clear = () => setParams({});
  return (
    <main className="page-shell">
      <section className="page-intro"><span className="eyebrow">The library</span><h1>Explore resources<span className="accent">.</span></h1><p>Useful things for your next big idea, all in one place.</p></section>
      <div className="filter-toolbar">
        <label className="search-field"><Search size={18} /><input value={search} onChange={(event) => setFilter("q", event.target.value)} placeholder="Search resources..." aria-label="Search resources" />{search && <button onClick={() => setFilter("q", "")} aria-label="Clear search"><X size={16} /></button>}</label>
        <label className="select-field"><SlidersHorizontal size={16} /><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => setFilter("category", event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
        <label className="select-field"><span className="sr-only">Filter by type</span><select value={type} onChange={(event) => setFilter("type", event.target.value)}><option value="">All types</option>{types.map((item) => <option key={item}>{item}</option>)}</select></label>
        {(search || type || category) && <button className="clear-filters" onClick={clear}>Clear filters <X size={14} /></button>}
      </div>
      <div className="results-caption"><span>{pagination.total ?? resources.length} resources</span><span>Newest first</span></div>
      {error && <div className="notice error">{error}</div>}
      <ResourceGrid resources={resources} loading={loading} />
      {!loading && pagination.pages > 1 && <div className="pagination"><button className="button secondary" disabled={pagination.page <= 1} onClick={() => setFilter("page", String(pagination.page - 1))}>Previous</button><span>Page {pagination.page} of {pagination.pages}</span><button className="button secondary" disabled={pagination.page >= pagination.pages} onClick={() => setFilter("page", String(pagination.page + 1))}>Next</button></div>}
    </main>
  );
}
