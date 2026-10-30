import { ArrowRight, BarChart3, CheckCircle2, Leaf, MapPinned, ShieldCheck, Sprout, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: BarChart3, title: 'Evidence-led planning', text: 'Explore seasonal crop productivity using the cleaned NISR agricultural survey data.' },
  { icon: MapPinned, title: 'District comparisons', text: 'Compare crop yield patterns across districts and provinces to identify where attention may be needed.' },
  { icon: TrendingUp, title: 'Track change over time', text: 'Review 2023–2025 yield patterns by crop and season, using the available data.' },
  { icon: ShieldCheck, title: 'Transparent evidence', text: 'See the source, reliability flags, and limits of the dataset behind the indicators.' },
];
export default function HomePage() {
  return <div className="home-page">
    <header className="site-header">
      <Link to="/" className="brand"><img src="/logo/agri-sight-mark-transparent.png" alt="Agri-Sight Rwanda logo"/><span><b>Agri-Sight Rwanda</b><small>Agricultural Intelligence</small></span></Link>
      <nav><a href="#features">Features</a><a href="#insights">Insights</a><a href="#about">About</a></nav>
      <div className="header-actions"><Link className="btn btn-outline" to="/login">Sign in</Link><Link className="btn btn-primary" to="/dashboard">Open dashboard <ArrowRight size={16}/></Link></div>
    </header>
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse-dot"/> NISR BIG DATA HACKATHON · TRACK 1</div>
          <h1>Turning agricultural data into <em>smarter decisions</em> for Rwanda</h1>
          <p>Data-driven agricultural intelligence for planners, extension officers, and partners working toward a more productive and food-secure Rwanda.</p>
          <div className="hero-actions"><Link className="btn btn-primary btn-lg" to="/dashboard">Explore the dashboard <ArrowRight size={18}/></Link><a className="btn btn-outline btn-lg" href="#features">Discover the platform</a></div>
          <div className="hero-proof"><span><CheckCircle2 size={17}/> NISR survey data</span><span><CheckCircle2 size={17}/> 2023–2025 coverage</span><span><CheckCircle2 size={17}/> District-level insights</span></div>
        </div>
        <div className="hero-image"><div className="hero-image-overlay"/><div className="hero-image-label"><span className="round-icon"><Sprout size={20}/></span><div><b>Better data. Stronger agriculture.</b><small>Insights for a more prosperous Rwanda</small></div></div></div>
      </section>
      <section className="impact-strip" id="insights">
        <div><span className="impact-icon"><Leaf/></span><p><b>Evidence first</b><small>Indicators derived from your cleaned NISR data</small></p></div>
        <div><span className="impact-icon"><MapPinned/></span><p><b>Local perspective</b><small>Explore differences across districts and crops</small></p></div>
        <div><span className="impact-icon"><TrendingUp/></span><p><b>Action-oriented</b><small>Spot yield gaps that warrant closer investigation</small></p></div>
      </section>
      <section className="features-section section-wrap" id="features">
        <div className="section-heading"><span className="section-kicker">POWERFUL TOOLS FOR BETTER PLANNING</span><h2>From agricultural data to practical insight</h2><p>Agri-Sight brings cleaned survey data into one clear workspace for exploration and comparison.</p></div>
        <div className="feature-grid">{features.map(({icon:Icon,title,text})=><article className="feature-card" key={title}><span className="feature-icon"><Icon size={23}/></span><h3>{title}</h3><p>{text}</p><Link to="/dashboard">Explore insight <ArrowRight size={15}/></Link></article>)}</div>
      </section>
      <section className="data-section" id="about"><div className="data-photo"/><div className="data-copy"><span className="section-kicker">DATA FOR A MORE PRODUCTIVE RWANDA</span><h2>Understand the patterns behind agricultural productivity</h2><p>Use district, crop, year, and season filters to investigate differences in recorded yields. The dashboard uses the cleaned dataset provided for this project and labels the source clearly.</p><ul><li><CheckCircle2/> Seasonal and annual comparisons</li><li><CheckCircle2/> Crop and district productivity views</li><li><CheckCircle2/> Reliability-aware interpretation</li></ul><Link className="btn btn-primary" to="/dashboard">View productivity dashboard <ArrowRight size={16}/></Link></div></section>
      <section className="cta-band"><div><h2>Better decisions start with better evidence.</h2><p>Explore agricultural productivity across Rwanda with Agri-Sight.</p></div><Link className="btn btn-white" to="/dashboard">Explore dashboard <ArrowRight size={16}/></Link></section>
    </main>
    <footer className="site-footer"><Link to="/" className="brand"><img src="/logo/agri-sight-mark-transparent.png" alt=""/><span><b>Agri-Sight Rwanda</b><small>Agricultural Intelligence</small></span></Link><span>© 2026 Agri-Sight Rwanda · NISR agricultural survey data</span><span>Better data. Stronger agriculture.</span></footer>
  </div>;
}
