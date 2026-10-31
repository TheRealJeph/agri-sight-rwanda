import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Bell, ChevronDown, CircleHelp, Download, Filter, Home, Leaf, MapPinned, Menu, Search, Settings, Sprout, UserRound, X, Database, RefreshCw, TrendingDown, TrendingUp, Wheat } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../api/client';

type Row = { crop:string; district:string; province:string; yield:number; records:number; reliable:boolean };
type Payload = { source:string; period:string; filters:{years:number[];seasons:string[];crops:string[];districts:string[];provinces:string[]}; summary:{district_crop_rows:number;reliable_rows:number;average_yield_kg_ha:number;national_reference_yield_kg_ha:number;farmer_observations:number;plot_records:number;districts_covered:number;crops_covered:number};by_year:{year:string;yield:number;districts:number}[];by_crop:{crop:string;yield:number;records:number}[];districts_lowest_yield:{district:string;province:string;yield:number;records:number}[];districts_highest_yield:{district:string;province:string;yield:number;records:number}[];latest_year_crop_district:Row[]};
const fmt=(n:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n);
export default function DashboardPage(){
 const {user}=useAuth();
 const location = useLocation();
 const [data,setData]=useState<Payload|null>(null); const [error,setError]=useState(''); const [loading,setLoading]=useState(true);
 const [year,setYear]=useState('all'); const [season,setSeason]=useState('all'); const [crop,setCrop]=useState('all'); const [district,setDistrict]=useState('all'); const [query,setQuery]=useState(''); const [mobileNav,setMobileNav]=useState(false); const [profileMenuOpen, setProfileMenuOpen] = useState(false);
 async function load() {
  setLoading(true);
  setError('');

  try {
    const params = new URLSearchParams({ year, season, crop, district });
    const { data } = await api.get<Payload>(
      `/analytics/dashboard/?${params.toString()}`
    );

    setData(data);
  } catch (e) {
    setError(
      e instanceof Error
        ? e.message
        : 'Could not load the NISR dataset.'
    );
  } finally {
    setLoading(false);
  }
}
 useEffect(()=>{void load();},[year,season,crop,district]);
 const tableRows=useMemo(()=>{const rows=data?.latest_year_crop_district??[];return rows.filter(r=>(district==='all'||r.district===district)&&(crop==='all'||r.crop===crop)&&`${r.district} ${r.crop} ${r.province}`.toLowerCase().includes(query.toLowerCase())).slice(0,12)},[data,query,district,crop]);
 function exportCsv(){const rows=data?.latest_year_crop_district??[];const head='crop,district,province,yield_kg_ha,records,reliable';const body=rows.map(r=>[r.crop,r.district,r.province,r.yield,r.records,r.reliable].map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');const blob=new Blob([head+'\n'+body],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='agri-sight-nisr-dashboard.csv';a.click();URL.revokeObjectURL(url);}
 const nav = [
  { to: '/dashboard', label: 'Overview', icon: Home },
  { to: '/crop-analysis', label: 'Crop Analysis', icon: Wheat },
  { to: '/district-explorer', label: 'District Explorer', icon: MapPinned },
  { to: '/data-quality', label: 'Data Quality', icon: Database },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/settings', label: 'Settings', icon: Settings },
];
 return <div className="app-shell">
  <aside className={`app-sidebar ${mobileNav?'open':''}`}><Link to="/" className="sidebar-brand"><img src="/logo/agri-sight-mark-transparent.png" alt="Agri-Sight"/><span><b>Agri-Sight Rwanda</b><small>Agricultural Intelligence</small></span><button className="mobile-close" onClick={()=>setMobileNav(false)} aria-label="Close navigation"><X/></button></Link>
   <div className="sidebar-label">WORKSPACE</div><nav className="sidebar-nav">{nav.map(({to,label,icon:Icon})=><Link key={to} className={location.pathname === to ? 'active' : ''} to={to}><Icon size={18}/>{label}</Link>)}</nav>
   <div className="sidebar-bottom"><div className="sidebar-leaf"><Sprout size={38}/><b>Better data.<br/>Stronger agriculture.</b><small>Insights for a prosperous Rwanda</small></div><div className="sidebar-foot">NISR DATA · 2023–2025</div></div>
  </aside>
  {mobileNav&&<button className="nav-scrim" onClick={()=>setMobileNav(false)} aria-label="Close menu"/>}
  <main className="dashboard-main">
   <header className="dashboard-topbar"><button className="mobile-menu" onClick={()=>setMobileNav(true)} aria-label="Open menu"><Menu/></button><div className="searchbox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search districts, crops, or reports…"/></div><div className="topbar-actions"><button className="icon-button" title="Help"><CircleHelp size={19}/></button><button className="icon-button" title="Notifications"><Bell size={19}/></button>
   <div className="profile-dropdown">
  <button
    type="button"
    className="user-menu user-menu-trigger"
    aria-label="Open profile menu"
    aria-expanded={profileMenuOpen}
    onClick={() => setProfileMenuOpen((open) => !open)}
  >
    <span className="avatar">
      {(user?.profile.full_name || 'AS')
        .split(' ')
        .map((x) => x[0])
        .slice(0, 2)
        .join('')}
    </span>

    <span className="user-name">
      <b>{user?.profile.full_name || 'Agriculture Analyst'}</b>
      <small>{user?.profile.occupation || 'Dashboard visitor'}</small>
    </span>

    <ChevronDown size={15} />
  </button>

  {profileMenuOpen && (
    <div className="profile-dropdown-menu">
      <Link to="/profile" onClick={() => setProfileMenuOpen(false)}>
        My Profile
      </Link>

      <Link to="/settings" onClick={() => setProfileMenuOpen(false)}>
        Settings
      </Link>

      <Link
        to="/logout"
        className="logout-link"
        onClick={() => setProfileMenuOpen(false)}
      >
        Logout
      </Link>
    </div>
  )}
</div></div></header>
   <div className="dashboard-content">
    <div className="page-title-row"><div><div className="breadcrumbs">Workspace <span>/</span> Overview</div><h1>National Productivity Overview</h1><p>Explore agricultural productivity trends and identify district-level yield gaps.</p></div><div className="title-actions"><span className="data-source-tag"><span/> NISR DATA · {data?.period||'2023–2025'}</span><button className="btn btn-outline btn-small" onClick={exportCsv}><Download size={15}/> Export CSV</button></div></div>
    <section className="filter-panel"><div className="filter-heading"><span><Filter size={17}/> Filters</span><button onClick={()=>{setYear('all');setSeason('all');setCrop('all');setDistrict('all')}}>Reset filters</button></div><div className="filter-controls"><label>Survey year<select value={year} onChange={e=>setYear(e.target.value)}><option value="all">All years</option>{data?.filters.years.map(y=><option key={y}>{y}</option>)}</select></label><label>Season<select value={season} onChange={e=>setSeason(e.target.value)}><option value="all">All seasons</option>{data?.filters.seasons.map(s=><option key={s}>{s}</option>)}</select></label><label>Crop<select value={crop} onChange={e=>setCrop(e.target.value)}><option value="all">All crops</option>{data?.filters.crops.map(c=><option key={c}>{c}</option>)}</select></label><label>District<select value={district} onChange={e=>setDistrict(e.target.value)}><option value="all">All districts</option>{data?.filters.districts.map(d=><option key={d}>{d}</option>)}</select></label><button className="btn btn-primary apply-filter" onClick={()=>void load()}><Filter size={15}/> Apply filters</button></div></section>
    {error&&<div className="inline-error"><b>Unable to load dashboard data</b><span>{error}</span><button className="btn btn-outline btn-small" onClick={()=>void load()}><RefreshCw size={15}/> Retry</button></div>}
    {loading&&!data?<div className="loading-card"><span className="spinner"/><b>Loading your NISR agricultural data…</b><small>Reading the cleaned district, crop, season, and year summary.</small></div>:data&&<>
     <section className="metric-grid"><Metric icon={<Sprout/>} label="Average recorded yield" value={`${fmt(data.summary.average_yield_kg_ha)} kg/ha`} note="Across reliable district-crop records" tone="green"/><Metric icon={<Wheat/>} label="Farmer observations" value={fmt(data.summary.farmer_observations)} note="Summed across selected summary rows" tone="blue"/><Metric icon={<MapPinned/>} label="Districts covered" value={fmt(data.summary.districts_covered)} note="In the selected data view" tone="purple"/><Metric icon={<Leaf/>} label="Crops represented" value={fmt(data.summary.crops_covered)} note={`${fmt(data.summary.reliable_rows)} reliable rows`} tone="orange"/></section>
     <div className="chart-grid"><section className="panel chart-panel"><div className="panel-heading"><div><h2>Productivity trend</h2><p>Mean weighted yield by year · kg/ha</p></div><span className="chart-icon"><TrendingUp size={17}/></span></div><div className="chart-area">{data.by_year.length?<ResponsiveContainer width="100%" height="100%"><LineChart data={data.by_year} margin={{top:12,right:12,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7efeb"/><XAxis dataKey="year" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false} width={58}/><Tooltip formatter={(v)=>[`${fmt(Number(v))} kg/ha`,'Mean yield']}/><Line type="monotone" dataKey="yield" stroke="#0b8b61" strokeWidth={3} dot={{r:4,fill:'#0b8b61'}} activeDot={{r:6}}/></LineChart></ResponsiveContainer>:<Empty/>}</div><div className="chart-footnote">Year-level averages are based on reliable records available under the selected filters.</div></section>
     <section className="panel chart-panel" id="crop-analysis"><div className="panel-heading"><div><h2>Crop productivity comparison</h2><p>Highest mean weighted yields in the current selection</p></div><span className="chart-icon"><BarChart3 size={17}/></span></div><div className="chart-area">{data.by_crop.length?<ResponsiveContainer width="100%" height="100%"><BarChart data={data.by_crop.slice(0,7)} layout="vertical" margin={{top:4,right:18,left:10,bottom:0}}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e7efeb"/><XAxis type="number" tickLine={false} axisLine={false}/><YAxis type="category" dataKey="crop" width={112} tickLine={false} axisLine={false} tick={{fontSize:11}}/><Tooltip formatter={(v)=>[`${fmt(Number(v))} kg/ha`,'Mean yield']}/><Bar dataKey="yield" fill="#138a62" radius={[0,5,5,0]} barSize={17}/></BarChart></ResponsiveContainer>:<Empty/>}</div><div className="chart-footnote">Crop-level values summarize reliable district-crop rows; crops are not directly comparable without agronomic context.</div></section></div>
     <div className="chart-grid lower-charts"><section className="panel" id="district-analysis"><div className="panel-heading"><div><h2>Districts requiring closer review</h2><p>Lowest mean yield in available reliable records</p></div><span className="chart-icon warning"><TrendingDown size={17}/></span></div><div className="rank-list">{data.districts_lowest_yield.slice(0,6).map((r,i)=><div className="rank-row" key={r.district}><span className="rank-number">{i+1}</span><div className="rank-label"><b>{r.district}</b><small>{r.province} Province · {fmt(r.records)} records</small></div><div className="rank-value"><b>{fmt(r.yield)}</b><small>kg/ha</small></div></div>)}</div><p className="chart-footnote">Low yield is a screening signal, not proof of cause. Check sample size, crop mix, season, and reliability before action.</p></section>
     <section className="panel"><div className="panel-heading"><div><h2>Highest mean yields</h2><p>Districts with stronger recorded yields</p></div><span className="chart-icon"><TrendingUp size={17}/></span></div><div className="rank-list">{data.districts_highest_yield.slice(0,6).map((r,i)=><div className="rank-row" key={r.district}><span className="rank-number positive">{i+1}</span><div className="rank-label"><b>{r.district}</b><small>{r.province} Province · {fmt(r.records)} records</small></div><div className="rank-value"><b>{fmt(r.yield)}</b><small>kg/ha</small></div></div>)}</div><p className="chart-footnote">Use comparisons to guide investigation, not as a standalone ranking of farmer performance.</p></section></div>
     <section className="panel data-table-panel"><div className="panel-heading"><div><h2>District and crop records</h2><p>Latest-year records included in the cleaned summary · {data.period}</p></div><button className="btn btn-outline btn-small" onClick={exportCsv}><Download size={15}/> Export data</button></div><div className="table-wrap"><table><thead><tr><th>Crop</th><th>District</th><th>Province</th><th>Yield (kg/ha)</th><th>Records</th><th>Reliability</th></tr></thead><tbody>{tableRows.map((r,i)=><tr key={`${r.crop}-${r.district}-${i}`}><td><b>{r.crop}</b></td><td>{r.district}</td><td>{r.province}</td><td>{fmt(r.yield)}</td><td>{fmt(r.records)}</td><td><span className={`status-pill ${r.reliable?'reliable':'review'}`}>{r.reliable?'Reliable':'Review'}</span></td></tr>)}</tbody></table>{!tableRows.length&&<div className="empty-table">No records match this search and filter selection.</div>}</div></section>
     <section className="data-note" id="data-quality"><div className="note-icon"><Database size={20}/></div><div><b>Data source and interpretation</b><p>{data.source}. Dashboard indicators use the user-provided cleaned district-crop-season-year summary. Only rows marked reliable contribute to yield comparisons. Summary row counts are not unique farmer counts across years or seasons. Associations shown here do not explain causes of productivity differences.</p><Link to="/dashboard#data-quality">Data quality and methodology <span>→</span></Link></div></section>
    </>}
    <footer className="dashboard-footer"><span>© 2026 Agri-Sight Rwanda</span><span>Data: NISR Seasonal Agricultural Survey · 2023–2025</span><span><Leaf size={14}/> Better data. Stronger agriculture.</span></footer>
   </div>
  </main>
 </div>;
}
function Metric({icon,label,value,note,tone}:{icon:React.ReactNode;label:string;value:string;note:string;tone:string}){return <article className="metric-card"><span className={`metric-icon ${tone}`}>{icon}</span><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></article>}
function Empty(){return <div className="chart-empty">No reliable records for this selection.</div>}
