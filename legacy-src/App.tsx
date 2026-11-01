import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { MainLayout } from './components/layout';
import { PageLoader } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Dashboard & Analytics
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const ReportsPage = lazy(() => import('./pages/Reports').then(m => ({ default: m.ReportsPage })));

// Core entities
const LivestockRegistry = lazy(() => import('./pages/LivestockRegistry').then(m => ({ default: m.LivestockRegistry })));
const FarmRegistry = lazy(() => import('./pages/FarmRegistry').then(m => ({ default: m.FarmRegistry })));
const FarmerDatabase = lazy(() => import('./pages/FarmerDatabase').then(m => ({ default: m.FarmerDatabase })));

// Health Records
const VaccinationMonitoring = lazy(() => import('./pages/VaccinationMonitoring').then(m => ({ default: m.VaccinationMonitoring })));
const HealthEvents = lazy(() => import('./pages/HealthEvents').then(m => ({ default: m.HealthEvents })));
const DewormingsPage = lazy(() => import('./pages/DewormingsPage').then(m => ({ default: m.DewormingsPage })));

// Location Pages
const CountriesPage = lazy(() => import('./pages/reference/CountriesPage').then(m => ({ default: m.CountriesPage })));
const RegionsPage = lazy(() => import('./pages/reference/RegionsPage').then(m => ({ default: m.RegionsPage })));
const DistrictsPage = lazy(() => import('./pages/reference/DistrictsPage').then(m => ({ default: m.DistrictsPage })));
const WardsPage = lazy(() => import('./pages/reference/WardsPage').then(m => ({ default: m.WardsPage })));
const VillagesPage = lazy(() => import('./pages/reference/VillagesPage').then(m => ({ default: m.VillagesPage })));
const StreetsPage = lazy(() => import('./pages/reference/StreetsPage').then(m => ({ default: m.StreetsPage })));
const DivisionsPage = lazy(() => import('./pages/reference/DivisionsPage').then(m => ({ default: m.DivisionsPage })));

// Reference Data - Livestock
const SpeciesPage = lazy(() => import('./pages/reference/SpeciesPage').then(m => ({ default: m.SpeciesPage })));
const BreedsPage = lazy(() => import('./pages/reference/BreedsPage').then(m => ({ default: m.BreedsPage })));
const LivestockTypesPage = lazy(() => import('./pages/reference/LivestockTypesPage').then(m => ({ default: m.LivestockTypesPage })));
const LivestockObtainedMethodsPage = lazy(() => import('./pages/reference/LivestockObtainedMethodsPage').then(m => ({ default: m.LivestockObtainedMethodsPage })));

// Reference Data - User
const IdentityCardTypesPage = lazy(() => import('./pages/reference/IdentityCardTypesPage').then(m => ({ default: m.IdentityCardTypesPage })));
const SchoolLevelsPage = lazy(() => import('./pages/reference/SchoolLevelsPage').then(m => ({ default: m.SchoolLevelsPage })));
const LegalStatusesPage = lazy(() => import('./pages/reference/LegalStatusesPage').then(m => ({ default: m.LegalStatusesPage })));

// Reference Data - Health
const DiseasesPage = lazy(() => import('./pages/reference/DiseasesPage').then(m => ({ default: m.DiseasesPage })));
const VaccinesPage = lazy(() => import('./pages/reference/VaccinesPage').then(m => ({ default: m.VaccinesPage })));
const VaccineTypesPage = lazy(() => import('./pages/reference/VaccineTypesPage').then(m => ({ default: m.VaccineTypesPage })));
const MedicinesPage = lazy(() => import('./pages/reference/MedicinesPage').then(m => ({ default: m.MedicinesPage })));
const MedicineTypesPage = lazy(() => import('./pages/reference/MedicineTypesPage').then(m => ({ default: m.MedicineTypesPage })));
const AdministrationRoutesPage = lazy(() => import('./pages/reference/AdministrationRoutesPage').then(m => ({ default: m.AdministrationRoutesPage })));

// Reproduction Events
const PregnanciesPage = lazy(() => import('./pages/reproduction/PregnanciesPage').then(m => ({ default: m.PregnanciesPage })));
const BirthEventsPage = lazy(() => import('./pages/reproduction/BirthEventsPage').then(m => ({ default: m.BirthEventsPage })));
const CalvingsPage = lazy(() => import('./pages/reproduction/CalvingsPage').then(m => ({ default: m.CalvingsPage })));
const InseminationsPage = lazy(() => import('./pages/reproduction/InseminationsPage').then(m => ({ default: m.InseminationsPage })));
const AbortedPregnanciesPage = lazy(() => import('./pages/reproduction/AbortedPregnanciesPage').then(m => ({ default: m.AbortedPregnanciesPage })));
const DryoffsPage = lazy(() => import('./pages/reproduction/DryoffsPage').then(m => ({ default: m.DryoffsPage })));

// Lifecycle/Production Events
const TransfersPage = lazy(() => import('./pages/lifecycle/TransfersPage').then(m => ({ default: m.TransfersPage })));
const DisposalsPage = lazy(() => import('./pages/lifecycle/DisposalsPage').then(m => ({ default: m.DisposalsPage })));
const WeightChangesPage = lazy(() => import('./pages/lifecycle/WeightChangesPage').then(m => ({ default: m.WeightChangesPage })));
const FeedingsPage = lazy(() => import('./pages/lifecycle/FeedingsPage').then(m => ({ default: m.FeedingsPage })));
const MilkingsPage = lazy(() => import('./pages/lifecycle/MilkingsPage').then(m => ({ default: m.MilkingsPage })));

// Reference Data - Reproduction
const BirthTypesPage = lazy(() => import('./pages/reference/BirthTypesPage').then(m => ({ default: m.BirthTypesPage })));
const BirthProblemsPage = lazy(() => import('./pages/reference/BirthProblemsPage').then(m => ({ default: m.BirthProblemsPage })));
const HeatTypesPage = lazy(() => import('./pages/reference/HeatTypesPage').then(m => ({ default: m.HeatTypesPage })));
const SemenStrawTypesPage = lazy(() => import('./pages/reference/SemenStrawTypesPage').then(m => ({ default: m.SemenStrawTypesPage })));
const InseminationServicesPage = lazy(() => import('./pages/reference/InseminationServicesPage').then(m => ({ default: m.InseminationServicesPage })));
const ReproductiveProblemsPage = lazy(() => import('./pages/reference/ReproductiveProblemsPage').then(m => ({ default: m.ReproductiveProblemsPage })));

// Reference Data - Lifecycle
const DisposalTypesPage = lazy(() => import('./pages/reference/DisposalTypesPage').then(m => ({ default: m.DisposalTypesPage })));
const FeedingTypesPage = lazy(() => import('./pages/reference/FeedingTypesPage').then(m => ({ default: m.FeedingTypesPage })));
const MilkingMethodsPage = lazy(() => import('./pages/reference/MilkingMethodsPage').then(m => ({ default: m.MilkingMethodsPage })));
const StagesPage = lazy(() => import('./pages/Stages'));
const TestResultsPage = lazy(() => import('./pages/TestResults'));

// User Management
const UsersPage = lazy(() => import('./pages/users/UsersPage').then(m => ({ default: m.UsersPage })));
const SystemUsersPage = lazy(() => import('./pages/users/SystemUsersPage').then(m => ({ default: m.SystemUsersPage })));
const ExtensionOfficersPage = lazy(() => import('./pages/users/ExtensionOfficersPage').then(m => ({ default: m.ExtensionOfficersPage })));
const VetsPage = lazy(() => import('./pages/users/VetsPage').then(m => ({ default: m.VetsPage })));
const ExtensionOfficerFarmInvitesPage = lazy(() => import('./pages/users/ExtensionOfficerFarmInvitesPage').then(m => ({ default: m.ExtensionOfficerFarmInvitesPage })));

// Settings
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.SettingsPage })));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                {/* Dashboard & Analytics */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reports/:reportId" element={<ReportsPage />} />

                {/* User Management */}
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/admins" element={<SystemUsersPage />} />
                <Route path="/users/officers" element={<ExtensionOfficersPage />} />
                <Route path="/users/vets" element={<VetsPage />} />
                <Route path="/users/invites" element={<ExtensionOfficerFarmInvitesPage />} />

                {/* Core Entities */}
                <Route path="/livestock" element={<LivestockRegistry />} />
                <Route path="/farms" element={<FarmRegistry />} />
                <Route path="/farmers" element={<FarmerDatabase />} />

                {/* Health Records */}
                <Route path="/health/vaccinations" element={<VaccinationMonitoring />} />
                <Route path="/health/treatments" element={<HealthEvents />} />
                <Route path="/health/dewormings" element={<DewormingsPage />} />

                {/* Reproduction */}
                <Route path="/reproduction/pregnancies" element={<PregnanciesPage />} />
                <Route path="/reproduction/births" element={<BirthEventsPage />} />
                <Route path="/reproduction/calvings" element={<CalvingsPage />} />
                <Route path="/reproduction/inseminations" element={<InseminationsPage />} />
                <Route path="/reproduction/abortions" element={<AbortedPregnanciesPage />} />
                <Route path="/reproduction/dryoffs" element={<DryoffsPage />} />

                {/* Production / Lifecycle */}
                <Route path="/production/milkings" element={<MilkingsPage />} />
                <Route path="/production/weights" element={<WeightChangesPage />} />
                <Route path="/production/feedings" element={<FeedingsPage />} />
                <Route path="/production/transfers" element={<TransfersPage />} />
                <Route path="/production/disposals" element={<DisposalsPage />} />

                {/* Locations */}
                <Route path="/locations/countries" element={<CountriesPage />} />
                <Route path="/locations/regions" element={<RegionsPage />} />
                <Route path="/locations/districts" element={<DistrictsPage />} />
                <Route path="/locations/wards" element={<WardsPage />} />
                <Route path="/locations/villages" element={<VillagesPage />} />
                <Route path="/locations/streets" element={<StreetsPage />} />
                <Route path="/locations/divisions" element={<DivisionsPage />} />

                {/* Reference Data - Livestock */}
                <Route path="/data/species" element={<SpeciesPage />} />
                <Route path="/data/breeds" element={<BreedsPage />} />
                <Route path="/data/livestock-types" element={<LivestockTypesPage />} />
                <Route path="/data/obtained-methods" element={<LivestockObtainedMethodsPage />} />

                {/* Reference Data - Health */}
                <Route path="/data/diseases" element={<DiseasesPage />} />
                <Route path="/data/vaccines" element={<VaccinesPage />} />
                <Route path="/data/vaccine-types" element={<VaccineTypesPage />} />
                <Route path="/data/medicines" element={<MedicinesPage />} />
                <Route path="/data/medicine-types" element={<MedicineTypesPage />} />
                <Route path="/data/admin-routes" element={<AdministrationRoutesPage />} />

                {/* Reference Data - Reproduction */}
                <Route path="/data/birth-types" element={<BirthTypesPage />} />
                <Route path="/data/birth-problems" element={<BirthProblemsPage />} />
                <Route path="/data/heat-types" element={<HeatTypesPage />} />
                <Route path="/data/semen-types" element={<SemenStrawTypesPage />} />
                <Route path="/data/insemination-services" element={<InseminationServicesPage />} />
                <Route path="/data/reproductive-problems" element={<ReproductiveProblemsPage />} />

                {/* Reference Data - Lifecycle */}
                <Route path="/data/disposal-types" element={<DisposalTypesPage />} />
                <Route path="/data/feeding-types" element={<FeedingTypesPage />} />
                <Route path="/data/milking-methods" element={<MilkingMethodsPage />} />
                <Route path="/data/stages" element={<StagesPage />} />
                <Route path="/data/test-results" element={<TestResultsPage />} />

                {/* Reference Data - User/General */}
                <Route path="/data/id-types" element={<IdentityCardTypesPage />} />
                <Route path="/data/school-levels" element={<SchoolLevelsPage />} />
                <Route path="/data/legal-statuses" element={<LegalStatusesPage />} />

                {/* Settings */}
                <Route path="/settings" element={<SettingsPage />} />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
