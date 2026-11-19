import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, FilePlus2, LayoutDashboard, LogOut, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api.js";

const blankResource = {
  title: "", shortDescription: "", description: "", category: "", type: "PDF",
  externalUrl: "", componentCode: "", promptContent: "", featured: false, published: true,
};

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("techslot-admin-token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [requireLogin, setRequireLogin] = useState(false);
  const [form, setForm] = useState(null);
  const [files, setFiles] = useState({ thumbnail: null, file: null });
  const [busy, setBusy] = useState(false);

  async function loadAdmin() {
    const [stats, managed, cats, siteSettings] = await Promise.all([
      api.get("/admin/dashboard"),
      api.get("/resources/manage?limit=100"),
      api.get("/categories"),
      api.get("/admin/settings"),
    ]);
    setDashboard(stats.data);
    setResources(managed.data.resources);
    setCategories(cats.data.categories);
    setRequireLogin(siteSettings.data.settings.requireLoginForDownloads);
  }

  useEffect(() => {
    if (!token) return;
    loadAdmin().catch((reason) => {
      if (reason.response?.status === 401) {
        localStorage.removeItem("techslot-admin-token");
        setToken("");
      } else setError(reason.response?.data?.message || "Could not load the dashboard.");
    });
  }, [token]);

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/admin/login", { email, password });
      localStorage.setItem("techslot-admin-token", data.token);
      setToken(data.token);
    } catch (reason) {
      setError(reason.response?.data?.message || "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("techslot-admin-token");
    setToken("");
    setDashboard(null);
    setResources([]);
  }

  function editResource(resource) {
    setFiles({ thumbnail: null, file: null });
    setForm({
      ...blankResource,
      ...resource,
      category: resource.category?._id || resource.category || "",
      externalUrl: resource.externalUrl || "",
      componentCode: resource.componentCode || "",
      promptContent: resource.promptContent || "",
    });
  }

  async function saveResource(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key !== "_id" && key !== "__v" && key !== "createdAt" && key !== "updatedAt" && key !== "thumbnail" && key !== "fileUrl" && key !== "downloads" && key !== "slug") {
        body.append(key, typeof value === "boolean" ? String(value) : value ?? "");
      }
    });
    if (files.thumbnail) body.append("thumbnail", files.thumbnail);
    if (files.file) body.append("file", files.file);
    try {
      if (form._id) await api.put(`/resources/${form._id}`, body);
      else await api.post("/resources", body);
      setForm(null);
      setNotice(form._id ? "Resource updated." : "Resource created.");
      await loadAdmin();
    } catch (reason) {
      setError(reason.response?.data?.message || "Could not save this resource.");
    } finally {
      setBusy(false);
    }
  }

  async function removeResource(resource) {
    if (!window.confirm(`Delete “${resource.title}”? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    try {
      await api.delete(`/resources/${resource._id}`);
      setNotice("Resource deleted.");
      await loadAdmin();
    } catch (reason) {
      setError(reason.response?.data?.message || "Could not delete the resource.");
    }
  }

  async function saveCategory(event) {
    event.preventDefault();
    setError("");
    try {
      if (editingCategory) await api.put(`/categories/${editingCategory}`, { name: categoryName });
      else await api.post("/categories", { name: categoryName });
      setCategoryName("");
      setEditingCategory("");
      setNotice(editingCategory ? "Category updated." : "Category added.");
      await loadAdmin();
    } catch (reason) {
      setError(reason.response?.data?.message || "Could not save this category.");
    }
  }

  async function removeCategory(category) {
    setError("");
    try {
      await api.delete(`/categories/${category._id}`);
      setNotice("Category deleted.");
      await loadAdmin();
    } catch (reason) {
      setError(reason.response?.data?.message || "Could not delete the category.");
    }
  }

  async function saveSettings(event) {
    const checked = event.target.checked;
    setRequireLogin(checked);
    try {
      await api.put("/admin/settings", { requireLoginForDownloads: checked });
      setNotice("Download access setting saved.");
    } catch (reason) {
      setRequireLogin(!checked);
      setError(reason.response?.data?.message || "Could not save the setting.");
    }
  }

  if (!token) return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={login}>
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Back to site</Link>
        <span className="eyebrow">TECHSLOT · Admin</span>
        <h1>Welcome back<span className="accent">.</span></h1>
        <p>Sign in with the admin account configured on the server.</p>
        {error && <div className="notice error">{error}</div>}
        <label>Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <button className="button primary full-width" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
      </form>
    </main>
  );

  if (!dashboard && !error) return <main className="page-shell"><div className="detail-loading" /></main>;
  const statItems = [
    ["Resources", dashboard?.totals.resources ?? "—"],
    ["Categories", dashboard?.totals.categories ?? "—"],
    ["Downloads", dashboard?.totals.downloads ?? "—"],
    ["Registered users", dashboard?.totals.users ?? "—"],
  ];

  return (
    <main className="admin-shell">
      <div className="admin-topbar"><Link className="brand" to="/"><span className="brand-mark">T</span><span>TECHSLOT<span className="brand-dot">.</span></span></Link><span className="admin-pill"><LayoutDashboard size={14} /> Admin panel</span><button className="admin-logout" onClick={logout}><LogOut size={15} /> Sign out</button></div>
      {error && <div className="notice error">{error}<button onClick={() => setError("")}><X size={15} /></button></div>}
      {notice && <div className="notice success">{notice}<button onClick={() => setNotice("")}><X size={15} /></button></div>}
      <div className="admin-heading"><div><span className="eyebrow">Overview</span><h1>Your dashboard<span className="accent">.</span></h1><p>Keep the resource library fresh.</p></div><button className="button primary" onClick={() => { setFiles({ thumbnail: null, file: null }); setForm({ ...blankResource, category: categories[0]?._id || "" }); }}><Plus size={17} /> Add resource</button></div>
      <section className="stats-grid">{statItems.map(([label, value]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>

      <section className="admin-section"><div className="admin-section-heading"><div><span className="eyebrow">Content</span><h2>Resources</h2></div><span>{resources.length} shown</span></div>
        {resources.length === 0 ? <div className="empty-admin"><FilePlus2 size={26} /><p>No resources yet. Add your first one to get started.</p></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Resource</th><th>Category</th><th>Type</th><th>Status</th><th>Date published</th><th>Actions</th></tr></thead><tbody>{resources.map((item) => <tr key={item._id}><td><strong>{item.title}</strong><small>{item.shortDescription}</small></td><td>{item.category?.name || "—"}</td><td>{item.type}</td><td><span className={item.published ? "status published" : "status draft"}>{item.published ? "Published" : "Draft"}</span></td><td>{new Date(item.createdAt).toLocaleDateString()}</td><td><div className="table-actions"><button title="Edit resource" onClick={() => editResource(item)}><Pencil size={15} /></button><button title="Delete resource" onClick={() => removeResource(item)}><Trash2 size={15} /></button><Link title="View resource" to={`/resources/${item.slug}`}><ArrowUpRight size={15} /></Link></div></td></tr>)}</tbody></table></div>}
      </section>

      <section className="admin-section"><div className="admin-section-heading"><div><span className="eyebrow">Organization</span><h2>Categories</h2></div><span>{categories.length} total</span></div>
        <form className="category-admin-form" onSubmit={saveCategory}><input aria-label="Category name" required maxLength={80} placeholder="New category name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} /><button className="button primary"><Plus size={15} />{editingCategory ? "Save category" : "Add category"}</button>{editingCategory && <button type="button" className="button secondary" onClick={() => { setEditingCategory(""); setCategoryName(""); }}>Cancel</button>}</form>
        <div className="category-admin-list">{categories.map((category) => <div className="category-admin-row" key={category._id}><span>{category.name}</span><div><button onClick={() => { setEditingCategory(category._id); setCategoryName(category.name); }} aria-label={`Edit ${category.name}`}><Pencil size={14} /></button><button onClick={() => removeCategory(category)} aria-label={`Delete ${category.name}`}><Trash2 size={14} /></button></div></div>)}</div>
      </section>
      <section className="admin-section settings-card"><div><span className="eyebrow">Access control</span><h2>Downloads require sign-in</h2><p>When enabled, the server requires a valid user session before a download.</p></div><label className="settings-toggle"><input type="checkbox" checked={requireLogin} onChange={saveSettings} /><span>{requireLogin ? "Enabled" : "Disabled"}</span></label></section>

      {form && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setForm(null); }}><section className="resource-modal" role="dialog" aria-modal="true" aria-labelledby="resource-form-title"><div className="modal-heading"><div><span className="eyebrow">{form._id ? "Update your library" : "Add to the library"}</span><h2 id="resource-form-title">{form._id ? "Edit resource" : "New resource"}</h2></div><button className="icon-button" onClick={() => setForm(null)} aria-label="Close"><X size={19} /></button></div>
        <form className="resource-form" onSubmit={saveResource}>
          <label>Title<input required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label>Short description<input required maxLength={300} value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} /></label>
          <label className="form-wide">Full description<textarea rows="4" maxLength={10000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label>Category<select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="">Select category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
          <label>Resource type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{["PDF", "File", "Prompt", "Component", "External Link", "Tool"].map((type) => <option key={type}>{type}</option>)}</select></label>
          {(form.type === "PDF" || form.type === "File") && <label className="form-wide upload-field"><span><Upload size={16} /> {files.file?.name || (form.fileId ? "Replace current file (optional)" : "Choose a file · max 25 MB")}</span><input type="file" accept={form.type === "PDF" ? ".pdf,application/pdf" : ".pdf,.zip,image/*,application/octet-stream"} onChange={(event) => setFiles({ ...files, file: event.target.files?.[0] || null })} required={!form._id && !form.fileId} /></label>}
          {(form.type === "External Link" || form.type === "Tool") && <label className="form-wide">External URL<input type="url" required placeholder="https://" value={form.externalUrl} onChange={(event) => setForm({ ...form, externalUrl: event.target.value })} /></label>}
          {form.type === "Prompt" && <label className="form-wide">Prompt content<textarea required rows="7" value={form.promptContent} onChange={(event) => setForm({ ...form, promptContent: event.target.value })} /></label>}
          {form.type === "Component" && <label className="form-wide">Component code<textarea required rows="9" className="code-input" value={form.componentCode} onChange={(event) => setForm({ ...form, componentCode: event.target.value })} /></label>}
          <label className="form-wide upload-field"><span><Upload size={16} /> {files.thumbnail?.name || (form.thumbnailFileId || form.thumbnail ? "Replace current thumbnail (optional)" : "Choose thumbnail image (optional)")}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFiles({ ...files, thumbnail: event.target.files?.[0] || null })} /></label>
          <div className="form-switches"><label><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Featured</label><label><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> Published</label></div>
          <div className="form-actions"><button type="button" className="button secondary" onClick={() => setForm(null)}>Cancel</button><button className="button primary" disabled={busy}>{busy ? "Saving..." : form._id ? "Save changes" : "Publish resource"}</button></div>
        </form></section></div>}
    </main>
  );
}
