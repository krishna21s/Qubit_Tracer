import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Activity, Cpu, Box as BoxIcon, ArrowRight, User } from 'reicon-react';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboardCards.css';

export default function DashboardContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    if (user) {
      const loadPic = () => {
        const stored = localStorage.getItem(`qt_profile_pic_${user.id}`);
        if (stored) setProfilePic(stored);
      };
      loadPic();
      window.addEventListener('qt_profile_pic_updated', loadPic);
      return () => window.removeEventListener('qt_profile_pic_updated', loadPic);
    }
  }, [user]);

  // Mock Data
  const hardwareStatus = [
    { name: 'IBM Brisbane', time: '127 qubits', status: 'Online', action: 'Connect' },
    { name: 'Rigetti Aspen-M', time: '79 qubits', status: 'Online', action: 'Connect' },
    { name: 'Google Sycamore', time: '53 qubits', status: 'Maint.', action: 'Details' }
  ];

  const leaderboard = [
    { rank: 1, name: 'Liana Britten', score: '45,009 QC' },
    { rank: 2, name: 'Bloral Craitor', score: '40,001 QC' },
    { rank: 3, name: 'Ilona Lischuk', score: '30,291 QC' },
    { rank: 4, name: 'Jenny Wilson', score: '29,290 QC' },
    { rank: 5, name: 'Esther Howard', score: '25,280 QC' },
  ];

  const [quantumNews, setQuantumNews] = useState([
    { date: 'Oct 24', title: 'Error Mitigation Milestone in 100+ Qubits', source: 'Quantum Daily', image: null, link: '#' },
    { date: 'Oct 23', title: 'New Topological Qubit Design', source: 'Q-Research Hub', image: null, link: '#' },
    { date: 'Oct 21', title: 'Financial Modeling Shows 40% Speedup', source: 'FinQ Tech', image: null, link: '#' }
  ]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://phys.org/rss-feed/physics-news/quantum-physics/');
        const data = await res.json();
        if (data && data.items && data.items.length > 0) {
          const formatted = data.items.slice(0, 3).map(item => ({
            date: new Date(item.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            title: item.title,
            source: data.feed.title || 'Phys.org',
            link: item.link,
            image: item.enclosure?.link || item.thumbnail || null
          }));
          setQuantumNews(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch live quantum news", err);
      } finally {
        setNewsLoading(false);
      }
    }
    fetchNews();
  }, []);

  const today = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="lp-dashboard-root">
      
      {/* 1. Header Section */}
      <header className="lp-header">
        <div className="lp-header-left">
          <div className="lp-date-badge">
            <span className="lp-date-day">{today.getDate()}</span>
            <span className="lp-date-month">{monthNames[today.getMonth()]}</span>
          </div>
          <div className="lp-greeting">
            <h1>Good Morning,</h1>
            <p>{user?.username || 'Quantum User'}</p>
          </div>
        </div>
        <div className="lp-header-right">
          <div className="lp-search-box">
            <Search size={18} className="lp-search-icon" />
            <input type="text" placeholder="Search..." className="lp-search-input" />
          </div>
          <button className="lp-btn-primary">Connect QPU</button>
        </div>
      </header>

      {/* 2. Hero Section (Blue Accent) */}
      <section className="lp-hero">
        <div className="lp-hero-header">
          <h2 style={{ color: 'var(--qt-bg-main)' }}>Your Tools</h2>
          <p style={{ color: 'var(--qt-bg-main)' }}>Here are the studios you are currently using</p>
        </div>
        <div className="lp-hero-cards">
          {/* Card 1 */}
          <div className="lp-tool-card" onClick={() => navigate('/qcircuit')}>
            <div className="lp-tool-card-top">
              <h3>Q-Circuit Studio</h3>
              <p>14 circuits | 82 simulations</p>
            </div>
            <div className="lp-tool-progress">
              <div className="lp-progress-bar"><div className="lp-progress-fill" style={{width: '60%'}}></div></div>
            </div>
            <div className="lp-tool-card-bottom">
              <button className="lp-btn-ghost">Details</button>
              <button className="lp-btn-primary">Launch</button>
            </div>
          </div>
          {/* Card 2 */}
          <div className="lp-tool-card" onClick={() => navigate('/legacy')}>
            <div className="lp-tool-card-top">
              <h3>OneQ Studio</h3>
              <p>5 states | 12 analyses</p>
            </div>
            <div className="lp-tool-progress">
              <div className="lp-progress-bar"><div className="lp-progress-fill" style={{width: '35%'}}></div></div>
            </div>
            <div className="lp-tool-card-bottom">
              <button className="lp-btn-ghost">Details</button>
              <button className="lp-btn-primary">Launch</button>
            </div>
          </div>
          {/* Card 3 */}
          <div className="lp-tool-card" onClick={() => navigate('/gate-lab')}>
            <div className="lp-tool-card-top">
              <h3>Gate Lab</h3>
              <p>3 custom gates | 8 experiments</p>
            </div>
            <div className="lp-tool-progress">
              <div className="lp-progress-bar"><div className="lp-progress-fill" style={{width: '80%'}}></div></div>
            </div>
            <div className="lp-tool-card-bottom">
              <button className="lp-btn-ghost">Details</button>
              <button className="lp-btn-primary">Launch</button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Middle Row */}
      <div className="lp-middle-grid">
        {/* Activity Chart */}
        <section className="lp-panel">
          <div className="lp-panel-header">
            <h2>Your activity in hours</h2>
            <p>Monitor your simulation activity</p>
          </div>
          <div className="lp-chart-container">
            <div className="lp-chart-y-axis">
              <span>7 h</span><span>6 h</span><span>5 h</span><span>4 h</span><span>3 h</span><span>2 h</span><span>1 h</span><span>0 h</span>
            </div>
            <div className="lp-chart-bars">
              <div className="lp-bar-group"><div className="lp-bar" style={{height: '30%'}}></div></div>
              <div className="lp-bar-group"><div className="lp-bar" style={{height: '45%'}}></div></div>
              <div className="lp-bar-group"><div className="lp-bar lp-bar-active" style={{height: '85%'}}><span className="lp-bar-tooltip">6h 1m</span></div></div>
              <div className="lp-bar-group"><div className="lp-bar" style={{height: '60%'}}></div></div>
            </div>
          </div>
        </section>

        {/* Hardware Telemetry (Schedule style) */}
        <section className="lp-panel">
          <div className="lp-panel-header">
            <h2>Hardware Telemetry</h2>
            <p>Your connected QPUs are scheduled for today</p>
          </div>
          <div className="lp-schedule-list">
            {hardwareStatus.map((hw, i) => (
              <div className="lp-schedule-item" key={i}>
                <div className="lp-schedule-info">
                  <div className="lp-schedule-title">
                    <h4>{hw.name}</h4>
                    <span className="lp-schedule-time">{hw.time}</span>
                  </div>
                  <p className="lp-schedule-sub">{hw.status}</p>
                </div>
                <button className={`lp-btn-${hw.status === 'Online' ? 'primary' : 'disabled'}`}>{hw.action}</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Bottom Row */}
      <div className="lp-bottom-grid">
        {/* Leaderboard */}
        <section className="lp-panel">
          <div className="lp-panel-header">
            <h2>Leaderboard</h2>
            <p>Your group's success table</p>
          </div>
          <div className="lp-leaderboard-list">
            {leaderboard.map((user, i) => (
              <div className={`lp-lb-item ${i < 2 ? 'lp-lb-top' : ''}`} key={i}>
                <div className="lp-lb-left">
                  <span className="lp-lb-rank">{user.rank}</span>
                  <div className="lp-lb-avatar"><User size={14} /></div>
                  <span className="lp-lb-name">{user.name}</span>
                </div>
                <span className="lp-lb-score">{user.score}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Courses (News Grid) */}
        <section className="lp-panel lp-panel-transparent">
          <div className="lp-panel-header">
            <h2>Quantum Pulse</h2>
            <p>We think you might like these latest breakthroughs</p>
          </div>
          {newsLoading && <div style={{ fontSize: '0.85rem', color: 'var(--qt-text-dim)' }}>Loading news...</div>}
          <div className="lp-news-grid">
            {!newsLoading && quantumNews.map((news, i) => (
              <a href={news.link} target="_blank" rel="noreferrer" className="lp-news-card" key={i}>
                <div className="lp-news-img" style={{ backgroundImage: news.image ? `url(${news.image})` : 'none' }}>
                  <div className="lp-news-rating"><StarIcon size={12} /> 5.0</div>
                </div>
                <div className="lp-news-content">
                  <h4>{news.title}</h4>
                  <p className="lp-news-source">{news.source}</p>
                  <p className="lp-news-desc">The world of quantum is incredible. For the ability to keep up with the topic...</p>
                  <div className="lp-news-footer">
                    <span>{news.date}</span>
                    <button className="lp-btn-icon"><ArrowRight size={14} /></button>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Quick inline icon component for Star
function StarIcon({size}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
}