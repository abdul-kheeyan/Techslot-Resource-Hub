import { ArrowUpRight, Download, FileCode2, FileText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api.js";

const typeIcons = { PDF: FileText, File: FileText, Prompt: Sparkles, Component: FileCode2 };

export default function ResourceCard({ resource }) {
  const Icon = typeIcons[resource.type] || ArrowUpRight;
  const thumbnail = resource.thumbnailFileId
    ? `${API_BASE_URL}/resources/${resource._id}/thumbnail`
    : resource.thumbnail;
  return (
    <article className="resource-card">
      <Link to={`/resources/${resource.slug}`} className="card-image">
        {thumbnail
          ? <img src={thumbnail} alt="" loading="lazy" />
          : <div className="image-placeholder"><Icon size={28} /></div>}
        {resource.featured && <span className="featured-label"><Sparkles size={12} /> Featured</span>}
      </Link>
      <div className="card-content">
        <div className="card-meta"><span>{resource.category?.name || "Resource"}</span><span>{resource.type}</span></div>
        <Link className="card-title" to={`/resources/${resource.slug}`}>{resource.title}</Link>
        <p>{resource.shortDescription}</p>
        <div className="card-bottom">
          <time>{new Date(resource.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time>
          <Link to={`/resources/${resource.slug}`} aria-label={`View ${resource.title}`}><Download size={16} /></Link>
        </div>
      </div>
    </article>
  );
}
