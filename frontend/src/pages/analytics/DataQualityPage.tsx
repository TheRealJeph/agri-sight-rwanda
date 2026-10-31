
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  Database,
  FileCheck2,
  Home,
  MapPinned,
  Menu,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserRound,
  Wheat,
  AlertCircle,
  X,
} from 'lucide-react';
import { api } from '../../api/client';

type DashboardQualityData = {
  summary?: {
    reliable_rows?: number;
    district_crop_rows?: number;
    districts_covered?: number;
    crops_covered?: number;
  };
  quality_years?: unknown[];
  filters?: {
    years?: number[];
  };
};

type DatasetInfo = {
  [key: string]: unknown;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);

function readableLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\.csv$/i, '')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined) return 'Not provided';

  if (typeof value === 'boolean') {
    return value ? 'Available' : 'Unavailable';
  }

  if (typeof value === 'number') {
    return formatNumber(value);
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.length ? `${value.length} items` : 'None';
  }

  return JSON.stringify(value);
}

export default function DataQualityPage() {
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);

  const [dashboard, setDashboard] =
    useState<DashboardQualityData | null>(null);
  const [datasets, setDatasets] = useState<DatasetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadQualityData() {
    setLoading(true);
    setError('');

    try {
      const [dashboardResponse, datasetsResponse] = await Promise.all([
        api.get<DashboardQualityData>('/analytics/dashboard/'),
        api.get<DatasetInfo>('/analytics/datasets/'),
      ]);

      const dashboardResult = dashboardResponse.data;
      const datasetsResult = datasetsResponse.data;

      setDashboard(dashboardResult);
      setDatasets(datasetsResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load data quality information.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQualityData();
  }, []);

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

  const qualityYears = dashboard?.quality_years ?? [];
  const datasetEntries = Object.entries(datasets ?? {});

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
                Workspace / Data Quality
              </p>
              <h1>Data Quality</h1>
              <p>
                Review dataset availability, reliable records, and the
                coverage of the agricultural data used in Agri-Sight Rwanda.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadQualityData()}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {loading && <p>Loading data quality information...</p>}

          {error && (
            <div className="data-note" role="alert">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => void loadQualityData()}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && dashboard && (
            <>
              <section className="metric-grid">
                <article className="metric-card">
                  <div className="metric-icon">
                    <Database size={20} />
                  </div>
                  <p>District-crop records</p>
                  <h2>
                    {formatNumber(
                      dashboard.summary?.district_crop_rows ?? 0
                    )}
                  </h2>
                </article>

                <article className="metric-card">
                  <div className="metric-icon">
                    <CheckCircle2 size={20} />
                  </div>
                  <p>Reliable records</p>
                  <h2>
                    {formatNumber(
                      dashboard.summary?.reliable_rows ?? 0
                    )}
                  </h2>
                </article>

                <article className="metric-card">
                  <div className="metric-icon">
                    <Wheat size={20} />
                  </div>
                  <p>Crops covered</p>
                  <h2>
                    {formatNumber(
                      dashboard.summary?.crops_covered ?? 0
                    )}
                  </h2>
                </article>

                <article className="metric-card">
                  <div className="metric-icon">
                    <MapPinned size={20} />
                  </div>
                  <p>Districts covered</p>
                  <h2>
                    {formatNumber(
                      dashboard.summary?.districts_covered ?? 0
                    )}
                  </h2>
                </article>
              </section>

              <section className="chart-grid">
                <article className="panel chart-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Dataset availability</h2>
                      <p>
                        Availability and file information returned by the
                        backend.
                      </p>
                    </div>
                    <Database size={20} />
                  </div>

                  {datasetEntries.length === 0 ? (
                    <p>No dataset information was returned by the API.</p>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Property</th>
                            <th>Reported value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {datasetEntries.map(([key, value]) => (
                            <tr key={key}>
                              <td>{readableLabel(key)}</td>
                              <td>{displayValue(value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </article>

                <article className="panel chart-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Quality report coverage</h2>
                      <p>
                        Years represented in the available quality report.
                      </p>
                    </div>
                    <FileCheck2 size={20} />
                  </div>

                  {qualityYears.length > 0 ? (
                    <div className="quality-year-list">
                      {qualityYears.map((item, index) => (
                        <div
                          className="quality-year-item"
                          key={`${String(item)}-${index}`}
                        >
                          <CheckCircle2 size={18} />
                          <span>{displayValue(item)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>
                      The API did not return any quality-report years.
                    </p>
                  )}

                  <p className="data-note">
                    Report coverage indicates which years are represented;
                    it does not, by itself, establish that every record is
                    complete or accurate.
                  </p>
                </article>
              </section>

              <section className="panel data-table-panel">
                <div className="panel-heading">
                  <div>
                    <h2>How to interpret these indicators</h2>
                    <p>
                      Use the available indicators carefully when making
                      agricultural decisions.
                    </p>
                  </div>
                  <ShieldCheck size={20} />
                </div>

                <div className="quality-guidance">
                  <div>
                    <CheckCircle2 size={20} />
                    <div>
                      <h3>Reliable records</h3>
                      <p>
                        The backend counts records marked reliable under its
                        current data-processing rules. This does not guarantee
                        that every value is error-free.
                      </p>
                    </div>
                  </div>

                  <div>
                    <Database size={20} />
                    <div>
                      <h3>Dataset availability</h3>
                      <p>
                        File availability confirms whether the expected
                        processed files are accessible. It is not a measure
                        of completeness.
                      </p>
                    </div>
                  </div>

                  <div>
                    <AlertCircle size={20} />
                    <div>
                      <h3>Known limitation</h3>
                      <p>
                        Detailed missing-value percentages, duplicate counts,
                        and validation-error totals are not shown unless the
                        backend explicitly provides them.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          <footer className="dashboard-footer">
            Agri-Sight Rwanda · Data quality and transparency
          </footer>
        </div>
      </main>
    </div>
  );
}
