import Login from './pages/Login';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BookOpen, Bookmark, Bus, Clock3, Flame, GraduationCap, Heart, Hospital,
  House, Landmark, Library, LocateFixed, MapPinned, Minus, Navigation,
  Phone, Pill, Plus, Search, Shield, ShoppingBag, Smile, Stethoscope, X,
} from 'lucide-react';
import Navbar from './components/common/Navbar';

declare const L: any;

type Category =
  | 'Clinics' | 'Libraries' | 'Shelters' | 'Hospitals' | 'Police Stations'
  | 'Pharmacies' | 'Dentists' | 'SPCA' | 'Fire Stations' | 'Home Affairs'
  | 'Malls' | 'Transport' | 'Schools / Universities';

type Place = { name: string; category: Category; area: string; lat: number; lng: number };

const categories: { name: Category; symbol: string; color: string }[] = [
  { name: 'Clinics',                symbol: '+',  color: '#b94b3c' },
  { name: 'Libraries',              symbol: '▮',  color: '#4f876f' },
  { name: 'Shelters',               symbol: '⌂',  color: '#cb8c38' },
  { name: 'Hospitals',              symbol: '+',  color: '#3b77a2' },
  { name: 'Police Stations',        symbol: '●',  color: '#375f93' },
  { name: 'Pharmacies',             symbol: '●',  color: '#81528d' },
  { name: 'Dentists',               symbol: '●',  color: '#77909c' },
  { name: 'SPCA',                   symbol: '♥',  color: '#815c54' },
  { name: 'Fire Stations',          symbol: '♦',  color: '#bd6240' },
  { name: 'Home Affairs',           symbol: '▦',  color: '#75664b' },
  { name: 'Malls',                  symbol: '●',  color: '#a45b83' },
  { name: 'Transport',              symbol: '▰',  color: '#847337' },
  { name: 'Schools / Universities', symbol: '◆',  color: '#43858a' },
];

const places: Place[] = ([
  ['Cape Town Civic Centre',     'Home Affairs',           'Cape Town',       -33.925, 18.424],
  ['Groote Schuur Hospital',     'Hospitals',              'Observatory',     -33.941, 18.465],
  ['Sea Point Police Station',   'Police Stations',        'Sea Point',       -33.918, 18.386],
  ['Cape Town Central Library',  'Libraries',              'CBD',             -33.925, 18.423],
  ['Woodstock Clinic',           'Clinics',                'Woodstock',       -33.927, 18.448],
  ['Mowbray Maternity Hospital', 'Hospitals',              'Mowbray',         -33.948, 18.475],
  ['Rondebosch Library',         'Libraries',              'Rondebosch',      -33.961, 18.476],
  ['Khayelitsha Mall',           'Malls',                  'Khayelitsha',     -34.037, 18.678],
  ['Mitchells Plain Clinic',     'Clinics',                'Mitchells Plain', -34.048, 18.617],
  ['Bellville Police Station',   'Police Stations',        'Bellville',       -33.900, 18.628],
  ['Tygerberg Hospital',         'Hospitals',              'Parow',           -33.908, 18.596],
  ['Milnerton Library',          'Libraries',              'Milnerton',       -33.879, 18.496],
  ['Hout Bay Fire Station',      'Fire Stations',          'Hout Bay',        -34.044, 18.348],
  ['Wynberg SPCA',               'SPCA',                   'Wynberg',         -34.003, 18.468],
  ['Claremont Transport Hub',    'Transport',              'Claremont',       -33.981, 18.465],
  ['UCT',                        'Schools / Universities', 'Rondebosch',      -33.957, 18.461],
  ['Table View Shelter',         'Shelters',               'Table View',      -33.824, 18.488],
  ['Kloof Street Pharmacy',      'Pharmacies',             'Gardens',         -33.932, 18.410],
] as [string, Category, string, number, number][]).map(([name, category, area, lat, lng]) => ({
  name, category, area, lat, lng,
}));

const categoryIcon = (category: Category, size = 14) => {
  const props = { size, strokeWidth: 2.2 };
  switch (category) {
    case 'Clinics':                return <Stethoscope {...props} />;
    case 'Libraries':              return <Library {...props} />;
    case 'Shelters':               return <House {...props} />;
    case 'Hospitals':              return <Hospital {...props} />;
    case 'Police Stations':        return <Shield {...props} />;
    case 'Pharmacies':             return <Pill {...props} />;
    case 'Dentists':               return <Smile {...props} />;
    case 'SPCA':                   return <Heart {...props} />;
    case 'Fire Stations':          return <Flame {...props} />;
    case 'Home Affairs':           return <Landmark {...props} />;
    case 'Malls':                  return <ShoppingBag {...props} />;
    case 'Transport':              return <Bus {...props} />;
    case 'Schools / Universities': return <GraduationCap {...props} />;
    default:                       return null;
  }
};

function LeafletMap({ places, onSelect, mapRef }: {
  places: Place[];
  onSelect: (place: Place) => void;
  mapRef: React.MutableRefObject<any>;
}) {
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<any>(null);

  useEffect(() => {
    if (!root.current || !L) return;
    const map = L.map(root.current, { zoomControl: false }).setView([-33.96, 18.50], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    layer.current = L.layerGroup().addTo(map);
    return () => map.remove();
  }, [mapRef]);

  useEffect(() => {
    if (!layer.current) return;
    layer.current.clearLayers();
    places.forEach(place => {
      const item = categories.find(c => c.name === place.category)!;
      const icon = L.divIcon({
        className: 'cape-marker-wrap',
        html: `<div class="cape-marker" style="--marker:${item.color}"><span>${renderToStaticMarkup(categoryIcon(place.category))}</span></div>`,
        iconSize: [34, 42],
        iconAnchor: [17, 42],
      });
      L.marker([place.lat, place.lng], { icon })
        .addTo(layer.current)
        .bindTooltip(`<strong>${place.name}</strong><br>${place.category}`, { direction: 'top' })
        .on('click', () => onSelect(place));
    });
  }, [places, onSelect]);

  return <div className="leaflet-map" ref={root} />;
}

function CapeGuide() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Category | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const mapRef = useRef<any>(null);

  const visible = useMemo(
    () => places.filter(p =>
      (!active || p.category === active) &&
      `${p.name} ${p.area} ${p.category}`.toLowerCase().includes(query.toLowerCase())),
    [active, query],
  );

  const selectPlace = useCallback((place: Place) => {
    setSelected(place);
    mapRef.current?.flyTo([place.lat, place.lng], 15);
  }, []);

return (
  <main className="guide-shell">
    <Navbar />

    <div className="map-stage">
      <LeafletMap places={visible} onSelect={selectPlace} mapRef={mapRef} />

      <header className="masthead">
        <h1>The Cape Guide</h1>
        <p>Find. Navigate. Connect.</p>
      </header>

      <section className="search-panel">
        <span className="glass"><Search size={19} /></span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for a place or service..."
        />
        <button className="locate" onClick={() => navigator.geolocation?.getCurrentPosition(
          pos => mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 14),
        )}>
          <LocateFixed size={17} />
        </button>
      </section>
    </div>
      {selected && (
        <section className="service-popup">
          <button className="service-close" onClick={() => setSelected(null)}><X size={18} /></button>
          <div className="service-title">
            <span className="service-icon" style={{ background: categories.find(c => c.name === selected.category)?.color }}>
              {categoryIcon(selected.category, 18)}
            </span>
            <div><h2>{selected.name}</h2><p>{selected.category}</p></div>
          </div>
          <div className="service-info">
            <p><MapPinned size={17} />{selected.area}, Cape Town</p>
            <p><Clock3 size={17} />{selected.category === 'Hospitals' ? 'Open 24 hours' : '08:00 – 16:30'}</p>
            <p><Phone size={17} />021 400 0000</p>
          </div>
        </section>
      )}

      <button className="panel-trigger legend-trigger" onClick={() => setLegendOpen(true)}>
        <MapPinned size={17} />Legend
      </button>

      {legendOpen && (
        <aside className="legend popup-panel">
          <button className="close-panel" onClick={() => setLegendOpen(false)}><X size={17} /></button>
          <h2>Legend</h2>
          {categories.map(item => (
            <button
              key={item.name}
              className={active === item.name ? 'active' : ''}
              onClick={() => { setActive(active === item.name ? null : item.name); setSelected(null); }}
            >
              <i style={{ background: item.color }}>{categoryIcon(item.name)}</i>{item.name}
            </button>
          ))}
        </aside>
      )}

      <div className="leaflet-zoom">
        <button onClick={() => mapRef.current?.zoomIn()}><Plus size={18} /></button>
        <button onClick={() => mapRef.current?.zoomOut()}><Minus size={18} /></button>
      </div>
    </main>
  );
}

function ProtectedDashboard() {
  const accessToken = localStorage.getItem('servicefinder_access_token');
  return accessToken ? <Dashboard /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CapeGuide />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}