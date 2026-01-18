import { useEffect, useState } from "react";
import JobCard from "./JobCard";
import "./App.css";

function App() {
  // --- STATE ---
  const [jobs, setJobs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [sort, setSort] = useState("-match_score");
  
  // Safe Storage Loading
  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      const saved = localStorage.getItem("savedJobs");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Storage error:", e);
      return [];
    }
  });

  const [appliedJobs, setAppliedJobs] = useState([]);
  const [view, setView] = useState("list");
  
  // Filters (Max Exp set to 50 internally to hide slider but keep logic)
  const [minExp, setMinExp] = useState(0);
  const [maxExp] = useState(50); 
  const [minSalary, setMinSalary] = useState(0);
  
  // UI Toggles
  const [selectedJob, setSelectedJob] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [offset, setOffset] = useState(0);

  // Saved Jobs Drawer State
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);
  const [savedJobsList, setSavedJobsList] = useState([]);

  // --- EFFECT 1: Fetch Locations ---
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/locations/")
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(err => console.log("Location Error:", err));
  }, []);

  // --- EFFECT 2: Fetch Main Jobs List ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (location) params.append("location", location);
      if (jobType) params.append("job_type", jobType);
      params.append("min_exp", minExp);
      params.append("max_exp", maxExp);
      params.append("min_salary", minSalary);
      // Fixed max salary internal cap
      params.append("max_salary", 5000000); 
      params.append("limit", 10);
      params.append("offset", offset);
      if (sort) params.append("sort", sort);

      fetch(`http://127.0.0.1:8000/api/jobs/?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                if (offset === 0) setJobs(data);
                else setJobs(prev => [...prev, ...data]);
            }
        })
        .catch(err => console.log("Fetch Error:", err));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, location, jobType, sort, minExp, maxExp, minSalary, offset]);

  // --- EFFECT 3: Fetch Saved Jobs (Drawer) ---
  useEffect(() => {
    if (showSavedDrawer && savedJobs.length > 0) {
      const idsParam = savedJobs.join(",");
      fetch(`http://127.0.0.1:8000/api/jobs/?ids=${idsParam}&limit=100`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setSavedJobsList(data);
        })
        .catch(err => console.log("Saved Fetch Error:", err));
    } else {
      setSavedJobsList([]);
    }
  }, [showSavedDrawer, savedJobs]);

  // --- HANDLERS ---
  const applyJob = (id) => {
    if (!appliedJobs.includes(id)) {
      setAppliedJobs([...appliedJobs, id]);
    }
  };

  const toggleSave = (id) => {
    let updated;
    if (savedJobs.includes(id)) {
      updated = savedJobs.filter(j => j !== id);
    } else {
      updated = [...savedJobs, id];
    }
    setSavedJobs(updated);
    localStorage.setItem("savedJobs", JSON.stringify(updated));
  };

  useEffect(() => { setOffset(0); }, [query, location, jobType, sort, minExp, maxExp, minSalary]);

  // --- RESET HANDLER (Clicking Logo) ---
  const resetApp = () => {
    // 1. Reset Filters
    setQuery("");
    setLocation("");
    setJobType("");
    setSort("-match_score");
    setMinExp(0);
    setMinSalary(0);
    
    // 2. Reset UI State
    setShowFilters(false);
    setShowSavedDrawer(false); // This closes the Saved Jobs drawer
    setView("list");
    setOffset(0);
    
    // 3. Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- RENDER ---
  return (
    <div className="app-container">
      {/* NAVBAR */}
      {/* NAVBAR */}
      <nav className="navbar">
        {/* Clickable Logo that resets state without reload */}
        <div className="nav-brand" onClick={resetApp}>
          GigSahara
        </div>
        
        <div className="nav-controls">
          <button 
              className={`nav-btn ${showFilters ? "active" : ""}`} 
              onClick={() => { setShowFilters(!showFilters); setShowSavedDrawer(false); }}
          >
          Filters
          </button>

          <button 
              className={`nav-btn ${showSavedDrawer ? "active" : ""}`}
              onClick={() => { setShowSavedDrawer(!showSavedDrawer); setShowFilters(false); }}
          >
          Saved ({savedJobs.length})
          </button>

          <div className="view-toggles">
              <button 
                className={view === "list" ? "active" : ""} 
                onClick={() => setView("list")}
              >
                List
              </button>
              <button 
                className={view === "grid" ? "active" : ""} 
                onClick={() => setView("grid")}
              >
                Grid
              </button>
          </div>
        </div>
      </nav>

      {/* FILTERS DRAWER */}
      {showFilters && (
        <div className="drawer filter-drawer">
          <div className="filter-row">
            <input 
                className="search-input"
                placeholder="Search jobs..." 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
            />
            <select value={location} onChange={e => setLocation(e.target.value)}>
                <option value="">All Locations</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <select value={jobType} onChange={e => setJobType(e.target.value)}>
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Part-time">Part-time</option>
            </select>
            <select value={sort} onChange={e => setSort(e.target.value)}>
               <option value="-match_score">Highest Match</option>
               <option value="-posted_date">Newest</option>
               <option value="salary_min">Salary (Low-High)</option>
               <option value="-salary_max">Salary (High-Low)</option>
            </select>
          </div>
          
          <div className="range-filters">
             {/* Only Min Experience Slider */}
             <div className="range-group">
                <label>Min Experience: {minExp}+ Years</label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={minExp} 
                  onChange={e => setMinExp(e.target.value)} 
                />
             </div>
             
             <div className="range-group">
                <label>Min Salary: ₹{minSalary}</label>
                <input 
                  type="range" 
                  min="0" 
                  max="5000000" 
                  step="100000" 
                  value={minSalary} 
                  onChange={e => setMinSalary(e.target.value)} 
                />
             </div>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      {showSavedDrawer ? (
        <div className="drawer saved-drawer">
          <h2>Your Saved Jobs</h2>
          {savedJobsList.length === 0 ? <p>No saved jobs found.</p> : (
            <div className={`job-container ${view === "grid" ? "grid-view" : "list-view"}`}>
              {savedJobsList.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  saved={true}
                  applied={appliedJobs.includes(job.id)}
                  onSave={toggleSave}
                  onApply={applyJob}
                  onOpen={setSelectedJob}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* MAIN JOB LIST */
        <>
          <div className={`job-container ${view === "grid" ? "grid-view" : "list-view"}`}>
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                saved={savedJobs.includes(job.id)}
                applied={appliedJobs.includes(job.id)}
                onSave={toggleSave}
                onApply={applyJob}
                onOpen={setSelectedJob}
              />
            ))}
          </div>
          <button className="load-more-btn" onClick={() => setOffset(offset + 10)}>Load More</button>
        </>
      )}

      {/* DETAILS MODAL */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedJob.title}</h2>
            <h3>{selectedJob.company}</h3>
            <p className="modal-location">{selectedJob.location}</p>
            <div className="modal-stats">
                <span>₹{selectedJob.salary_min} - ₹{selectedJob.salary_max}</span>
                <span>Exp: {selectedJob.experience} yrs</span>
            </div>
            <p className="modal-skills"><strong>Skills:</strong> {selectedJob.skills.join(", ")}</p>
            <button className="close-btn" onClick={() => setSelectedJob(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;