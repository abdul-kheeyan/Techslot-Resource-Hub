import { Link } from "react-router-dom";
import ResourceCard from "./ResourceCard.jsx";

export default function ResourceGrid({ resources, loading, empty = "No resources found." }) {
  if (loading) {
    return <div className="resource-grid">{Array.from({ length: 6 }, (_, index) => <div className="skeleton-card" key={index} />)}</div>;
  }
  if (!resources.length) return <div className="empty-state"><span className="eyebrow">Nothing here yet</span><p>{empty}</p><Link className="button secondary" to="/resources">Browse all resources</Link></div>;
  return <div className="resource-grid">{resources.map((resource) => <ResourceCard key={resource._id} resource={resource} />)}</div>;
}
