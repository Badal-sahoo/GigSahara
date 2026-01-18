import "./JobCard.css";

function JobCard({ job, saved, applied, onSave, onApply, onOpen }) {
  return (
    <div className="job-card" onClick={() => onOpen(job)}>
      {/* Top Section: Logo & Company Name */}
      <div className="card-header">
        <img src={`/${job.company}.png`} alt="Company Logo" className="company-logo" />

        <h3 className="company-name">{job.company}</h3>
      </div>

      {/* Middle Section: Tech Stack */}
      <div className="tech-stack-container">
        {job.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="tech-badge">
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && <span className="tech-badge">+{job.skills.length - 4}</span>}
      </div>

      {/* Bottom Section: Call to Action */}
      <div className="card-footer">
        <span className="view-more-text">View Details</span>
        
        <div className="action-buttons">
            {/* SAVE BUTTON */}
            <button 
                className={`btn save-btn ${saved ? "active" : ""}`}
                onClick={(e) => { e.stopPropagation(); onSave(job.id); }}
            >
                {saved ? "❤️ Saved" : "🤍 Save"}
            </button>

            {/* APPLY BUTTON */}
            <button 
                className={`btn apply-btn ${applied ? "active" : ""}`}
                onClick={(e) => { e.stopPropagation(); onApply(job.id); }}
                disabled={applied}
            >
                {applied ? "Applied" : "Apply Now"}
            </button>
        </div>
      </div>
    </div>
  );
}

export default JobCard;