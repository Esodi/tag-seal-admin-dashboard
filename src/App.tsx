import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout';
import {
  Dashboard,
  Analytics,
  LivestockRegistry,
  FarmRegistry,
  FarmerDatabase,
  VaccinationMonitoring,
  MovementTracking,
  HealthEvents,
  Regions,
  Districts
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/livestock" element={<LivestockRegistry />} />
          <Route path="/livestock/species" element={<LivestockRegistry />} />
          <Route path="/livestock/regions" element={<LivestockRegistry />} />
          <Route path="/farms" element={<FarmRegistry />} />
          <Route path="/farms/regions" element={<FarmRegistry />} />
          <Route path="/farmers" element={<FarmerDatabase />} />
          <Route path="/geographic/regions" element={<Regions />} />
          <Route path="/geographic/districts" element={<Districts />} />
          <Route path="/compliance/vaccinations" element={<VaccinationMonitoring />} />
          <Route path="/compliance/movements" element={<MovementTracking />} />
          <Route path="/compliance/health" element={<HealthEvents />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;



