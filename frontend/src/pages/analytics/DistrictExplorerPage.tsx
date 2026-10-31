
import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Database,
  Home,
  MapPinned,
  Menu,
  RefreshCw,
  Settings,
  UserRound,
  Wheat,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type DistrictRow = {
  district: string;
  province: string;
  yield: number;
  records: number;
};

type DashboardPayload = {
  filters: {
    years: number[];
    seasons: string[];
    crops: string[];
    districts: string[];
    provinces: string[];
  };
  summary: {
    reliable_rows: number;
    average_yield_kg_ha: number;
    districts_covered: number;
    crops_covered: number;
  };
  districts_lowest_yield: DistrictRow[];
  districts_highest_yield: DistrictRow[];
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);

export default function DistrictExplorerPage() {
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);

  const [data, setData] = useState<DashboardPayload | null>(null);
  const [year, setYear] = useState('all');
  const [season, setSeason] = useState('all');
  const [crop, setCrop] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDistrictData() {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        year,
        season,
        crop,
        district: 'all',
      });

      const { data: result } = await api.get<DashboardPayload>(
  `/analytics/dashboard/?${params.toString()}`
);

setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load district data.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDistrictData();
  }, [year, season, crop]);

  const navigation = [
    { to: '/dashboard', label: 'Overview', icon: Home },
    { to: '/crop-analysis', label: 'Crop Analysis', icon: Wheat },
    {
      to: '/district-explorer',
      label: 'District Explorer',
      icon: MapPinned,
    },
    { to: '/data-quality', label: 'Data Quality', icon: Database },
    { to: '/profile', label: 'Profile', icon: UserRound },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const lowestDistricts = data?.districts_lowest_yield ?? [];
  const highestDistricts = data?.districts_highest_yield ?? [];

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${mobileNav ? 'open' : ''}`}>
        <Link to="/" className="sidebar-brand">
  <img
    src="/logo/agri-sight-mark-transparent.png"
    alt="Agri-Sight"
  />
  <span>
    <b>Agri-Sight Rwanda</b>
    <small>Agricultural Intelligence</small>
  </span>
  <button
  type="button"
  className="mobile-close"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileNav(false);
  }}
  aria-label="Close navigation"
>
  <X size={20} />
</button>
</Link>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          {navigation.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={location.pathname === to ? 'active' : ''}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-foot">
            Agricultural intelligence
          </div>
        </div>
      </aside>

      {mobileNav && (
  <button
    type="button"
    className="nav-scrim"
    onClick={() => setMobileNav(false)}
    aria-label="Close menu"
  />
)}

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="page-title-row">
  <div>
    <button
      type="button"
      className="mobile-menu"
      onClick={() => setMobileNav(true)}
      aria-label="Open navigation"
    >
      <Menu size={22} />
    </button>
              <p className="breadcrumbs">
                Workspace / District Explorer
              </p>
              <h1>District Explorer</h1>
              <p>
                Compare agricultural yield performance across districts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadDistrictData()}
              className="filter-button"
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <section className="filter-panel">
            <div className="filter-heading">
              <MapPinned size={18} />
              <h2>Explore district performance</h2>
            </div>

            <div className="filter-controls">
              <label>
                Year
                <select
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                >
                  <option value="all">All available years</option>
                  {(data?.filters.years ?? []).map((value) => (
                    <option key={value} value={String(value)}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Season
                <select
                  value={season}
                  onChange={(event) => setSeason(event.target.value)}
                >
                  <option value="all">All seasons</option>
                  {(data?.filters.seasons ?? []).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Crop
                <select
                  value={crop}
                  onChange={(event) => setCrop(event.target.value)}
                >
                  <option value="all">All crops</option>
                  {(data?.filters.crops ?? []).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {loading && <p>Loading district data...</p>}

          {error && (
            <div className="data-note" role="alert">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => void loadDistrictData()}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && data && (
            <>
              <section className="metric-grid">
                <article className="metric-card">
                  <div className="metric-icon">
                    <MapPinned size={20} />
                  </div>
                  <p>Districts covered</p>
                  <h2>{formatNumber(data.summary.districts_covered)}</h2>
                </article>

                <article className="metric-card">
                  <div className="metric-icon">
                    <Wheat size={20} />
                  </div>
                  <p>Crops covered</p>
                  <h2>{formatNumber(data.summary.crops_covered)}</h2>
                </article>

                <article className="metric-card">
                  <div className="metric-icon">
                    <BarChart3 size={20} />
                  </div>
                  <p>Average yield</p>
                  <h2>
                    {formatNumber(data.summary.average_yield_kg_ha)}
                  </h2>
                  <span>kg/ha</span>
                </article>

                <article className="metric-card">
                  <div className="metric-icon">
                    <Database size={20} />
                  </div>
                  <p>Reliable records</p>
                  <h2>{formatNumber(data.summary.reliable_rows)}</h2>
                </article>
              </section>

              <section className="chart-grid">
                <article className="panel chart-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Districts with lowest recorded yields</h2>
                      <p>
                        Districts with lower yields in the selected data.
                      </p>
                    </div>
                  </div>

                  {lowestDistricts.length === 0 ? (
                    <p>No district yield data is available for these filters.</p>
                  ) : (
                    <div className="chart-area">
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={lowestDistricts}
                          layout="vertical"
                          margin={{ left: 15, right: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            tickFormatter={formatNumber}
                          />
                          <YAxis
                            type="category"
                            dataKey="district"
                            width={100}
                          />
                          <Tooltip
                            formatter={(value) => [
                              `${formatNumber(Number(value))} kg/ha`,
                              'Yield',
                            ]}
                          />
                          <Bar dataKey="yield" name="Yield" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </article>

                <article className="panel chart-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Districts with highest recorded yields</h2>
                      <p>
                        Districts with higher yields in the selected data.
                      </p>
                    </div>
                  </div>

                  {highestDistricts.length === 0 ? (
                    <p>No district yield data is available for these filters.</p>
                  ) : (
                    <div className="chart-area">
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={highestDistricts}
                          layout="vertical"
                          margin={{ left: 15, right: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            tickFormatter={formatNumber}
                          />
                          <YAxis
                            type="category"
                            dataKey="district"
                            width={100}
                          />
                          <Tooltip
                            formatter={(value) => [
                              `${formatNumber(Number(value))} kg/ha`,
                              'Yield',
                            ]}
                          />
                          <Bar dataKey="yield" name="Yield" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </article>
              </section>

              <section className="panel data-table-panel">
                <div className="panel-heading">
                  <div>
                    <h2>District comparison</h2>
                    <p>
                      Recorded yield and record counts from the selected data.
                    </p>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>District</th>
                        <th>Province</th>
                        <th>Recorded yield (kg/ha)</th>
                        <th>Records</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...lowestDistricts, ...highestDistricts].map(
                        (row, index) => (
                          <tr key={`${row.district}-${index}`}>
                            <td>{row.district}</td>
                            <td>{row.province}</td>
                            <td>{formatNumber(row.yield)}</td>
                            <td>{formatNumber(row.records)}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="data-note">
                  Results reflect the available processed dataset and selected
                  filters. Recorded yield differences alone do not establish
                  why a district performs differently.
                </p>
              </section>
            </>
          )}

          <footer className="dashboard-footer">
            Agri-Sight Rwanda · Agricultural data insights
          </footer>
        </div>
      </main>
    </div>
  );
}
