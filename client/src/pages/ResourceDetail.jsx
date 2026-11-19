import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Copy, Download, ExternalLink, FileCode2, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api, { API_BASE_URL } from "../api.js";

export default function ResourceDetail() {
  const { slug } = useParams();
  const [resource, setResource] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    api.get(`/resources/${encodeURIComponent(slug)}`).then(({ data }) => setResource(data.resource))
      .catch((reason) => setError(reason.response?.data?.message || "Could not load this resource."));
  }, [slug]);
  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access is unavailable in this browser.");
    }
  };
  if (error) return <main className="page-shell"><div className="empty-state"><span className="eyebrow">Resource unavailable</span><p>{error}</p><Link className="button secondary" to="/resources">Back to resources</Link></div></main>;
  if (!resource) return <main className="page-shell"><div className="detail-loading" /></main>;
  const body = resource.type === "Prompt" ? resource.promptContent : resource.componentCode;
  const download = `${API_BASE_URL}/resources/${resource._id}/download`;
  const thumbnail = resource.thumbnailFileId
    ? `${API_BASE_URL}/resources/${resource._id}/thumbnail`
    : resource.thumbnail;
  return (
    <main className="page-shell detail-shell">
      <Link className="back-link" to="/resources"><ArrowLeft size={16} /> All resources</Link>
      <div className="detail-layout">
        <article className="detail-main">
          <div className="card-meta"><span>{resource.category?.name}</span><span>{resource.type}</span><span>{new Date(resource.createdAt).toLocaleDateString()}</span></div>
          <h1>{resource.title}<span className="accent">.</span></h1>
          <p className="detail-summary">{resource.shortDescription}</p>
          {thumbnail && <img className="detail-image" src={thumbnail} alt="" />}
          {resource.description && <p className="detail-description">{resource.description}</p>}
          {body && <div className="code-panel"><div className="code-panel-top"><span><FileCode2 size={15} /> {resource.type === "Prompt" ? "Prompt" : "Code"}</span><button className="copy-button" onClick={() => copy(body)}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy"}</button></div><pre><code>{body}</code></pre></div>}
        </article>
        <aside className="detail-aside"><div className="aside-card"><span className="eyebrow">Ready when you are</span><p>{resource.type === "Prompt" ? "Copy this prompt and make it your own." : resource.type === "Component" ? "Copy the code and add it to your project." : "Get the resource and keep building."}</p>{body ? <button className="button primary full-width" onClick={() => copy(body)}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? "Copied to clipboard" : "Copy to clipboard"}</button> : <a className="button primary full-width" href={download} target={["Tool", "External Link"].includes(resource.type) ? "_blank" : undefined} rel="noreferrer"><Download size={17} />{["Tool", "External Link"].includes(resource.type) ? "Open resource" : "Download resource"}{["Tool", "External Link"].includes(resource.type) && <ExternalLink size={15} />}</a>}<div className="aside-divider" /><div className="aside-fact"><FileText size={16} /><span>Type</span><strong>{resource.type}</strong></div><div className="aside-fact"><ArrowUpRight size={16} /><span>Category</span><strong>{resource.category?.name}</strong></div></div></aside>
      </div>
    </main>
  );
}
