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

// Core entities
const LivestockRegistry = lazy(() => import('./pages/LivestockRegistry').then(m => ({ default: m.LivestockRegistry })));
const FarmRegistry = lazy(() => import('./pages/FarmRegistry').then(m => ({ default: m.FarmRegistry })));
const FarmerDatabase = lazy(() => import('./pages/FarmerDatabase').then(m => ({ default: m.FarmerDatabase })));

// Geographic Pages (in pages root)
const Regions = lazy(() => import('./pages/Regions').then(m => ({ default: m.Regions })));
const Districts = lazy(() => import('./pages/Districts').then(m => ({ default: m.Districts })));

// Compliance / Health Events
const VaccinationMonitoring = lazy(() => import('./pages/VaccinationMonitoring').then(m => ({ default: m.VaccinationMonitoring })));
const MovementTracking = lazy(() => import('./pages/MovementTracking').then(m => ({ default: m.MovementTracking })));
const HealthEvents = lazy(() => import('./pages/HealthEvents').then(m => ({ default: m.HealthEvents })));
const DewormingsPage = lazy(() => import('./pages/DewormingsPage').then(m => ({ default: m.DewormingsPage })));

// Reference Data - Geographic
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

// Lifecycle Events
const TransfersPage = lazy(() => import('./pages/lifecycle/TransfersPage').then(m => ({ default: m.TransfersPage })));
const DisposalsPage = lazy(() => import('./pages/lifecycle/DisposalsPage').then(m => ({ default: m.DisposalsPage })));
const WeightChangesPage = lazy(() => import('./pages/lifecycle/WeightChangesPage').then(m => ({ default: m.WeightChangesPage })));
const FeedingsPage = lazy(() => import('./pages/lifecycle/FeedingsPage').then(m => ({ default: m.FeedingsPage })));
const MilkingsPage = lazy(() => import('./pages/lifecycle/MilkingsPage').then(m => ({ default: m.MilkingsPage })));

// Reference Data - Reproduction
const BirthTypesPage = lazy(() => import('./pages/reference/BirthTypesPage').then(m => ({ default: m.BirthTypesPage })));
const BirthProblemsPage = lazy(() => import('./pages/reference/BirthProblemsPage').then(m => ({ default: m.BirthProblemsPage })));
const CalvingTypesPage = lazy(() => import('./pages/reference/CalvingTypesPage').then(m => ({ default: m.CalvingTypesPage })));
const CalvingProblemsPage = lazy(() => import('./pages/reference/CalvingProblemsPage').then(m => ({ default: m.CalvingProblemsPage })));
const HeatTypesPage = lazy(() => import('./pages/reference/HeatTypesPage').then(m => ({ default: m.HeatTypesPage })));
const SemenStrawTypesPage = lazy(() => import('./pages/reference/SemenStrawTypesPage').then(m => ({ default: m.SemenStrawTypesPage })));
const InseminationServicesPage = lazy(() => import('./pages/reference/InseminationServicesPage').then(m => ({ default: m.InseminationServicesPage })));
const ReproductiveProblemsPage = lazy(() => import('./pages/reference/ReproductiveProblemsPage').then(m => ({ default: m.ReproductiveProblemsPage })));

// Reference Data - Lifecycle
const DisposalTypesPage = lazy(() => import('./pages/reference/DisposalTypesPage').then(m => ({ default: m.DisposalTypesPage })));
const FeedingTypesPage = lazy(() => import('./pages/reference/FeedingTypesPage').then(m => ({ default: m.FeedingTypesPage })));
const MilkingMethodsPage = lazy(() => import('./pages/reference/MilkingMethodsPage').then(m => ({ default: m.MilkingMethodsPage })));

// User Management
const UsersPage = lazy(() => import('./pages/users/UsersPage').then(m => ({ default: m.UsersPage })));
const SystemUsersPage = lazy(() => import('./pages/users/SystemUsersPage').then(m => ({ default: m.SystemUsersPage })));
const ExtensionOfficersPage = lazy(() => import('./pages/users/ExtensionOfficersPage').then(m => ({ default: m.ExtensionOfficersPage })));
const VetsPage = lazy(() => import('./pages/users/VetsPage').then(m => ({ default: m.VetsPage })));
const FarmUsersPage = lazy(() => import('./pages/users/FarmUsersPage').then(m => ({ default: m.FarmUsersPage })));
const ExtensionOfficerFarmInvitesPage = lazy(() => import('./pages/users/ExtensionOfficerFarmInvitesPage').then(m => ({ default: m.ExtensionOfficerFarmInvitesPage })));
const OtpVerificationsPage = lazy(() => import('./pages/users/OtpVerificationsPage').then(m => ({ default: m.OtpVerificationsPage })));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
                {/* ... existing routes ... */}
                {/* Dashboard & Analytics */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />

                {/* Core entities */}
                <Route path="/livestock" element={<LivestockRegistry />} />
                <Route path="/livestock/species" element={<LivestockRegistry />} />
                <Route path="/livestock/regions" element={<LivestockRegistry />} />
                <Route path="/farms" element={<FarmRegistry />} />
                <Route path="/farms/regions" element={<FarmRegistry />} />
                <Route path="/farmers" element={<FarmerDatabase />} />

                {/* Existing geographic pages */}
                <Route path="/geographic/regions" element={<Regions />} />
                <Route path="/geographic/districts" element={<Districts />} />

                {/* Compliance */}
                <Route path="/compliance/vaccinations" element={<VaccinationMonitoring />} />
                <Route path="/compliance/movements" element={<MovementTracking />} />
                <Route path="/compliance/health" element={<HealthEvents />} />
                <Route path="/compliance/deworming" element={<DewormingsPage />} />

                {/* Reference Data - Geographic */}
                <Route path="/reference/countries" element={<CountriesPage />} />
                <Route path="/reference/regions" element={<RegionsPage />} />
                <Route path="/reference/districts" element={<DistrictsPage />} />
                <Route path="/reference/wards" element={<WardsPage />} />
                <Route path="/reference/villages" element={<VillagesPage />} />
                <Route path="/reference/streets" element={<StreetsPage />} />
                <Route path="/reference/divisions" element={<DivisionsPage />} />

                {/* Reference Data - Livestock */}
                <Route path="/reference/species" element={<SpeciesPage />} />
                <Route path="/reference/breeds" element={<BreedsPage />} />
                <Route path="/reference/livestock-types" element={<LivestockTypesPage />} />
                <Route path="/reference/livestock-obtained-methods" element={<LivestockObtainedMethodsPage />} />

                {/* Reference Data - User */}
                <Route path="/reference/identity-card-types" element={<IdentityCardTypesPage />} />
                <Route path="/reference/school-levels" element={<SchoolLevelsPage />} />
                <Route path="/reference/legal-statuses" element={<LegalStatusesPage />} />

                {/* Reference Data - Health */}
                <Route path="/reference/diseases" element={<DiseasesPage />} />
                <Route path="/reference/vaccines" element={<VaccinesPage />} />
                <Route path="/reference/vaccine-types" element={<VaccineTypesPage />} />
                <Route path="/reference/medicines" element={<MedicinesPage />} />
                <Route path="/reference/medicine-types" element={<MedicineTypesPage />} />
                <Route path="/reference/administration-routes" element={<AdministrationRoutesPage />} />

                {/* Reproduction Events */}
                <Route path="/reproduction/pregnancies" element={<PregnanciesPage />} />
                <Route path="/reproduction/births" element={<BirthEventsPage />} />
                <Route path="/reproduction/calvings" element={<CalvingsPage />} />
                <Route path="/reproduction/inseminations" element={<InseminationsPage />} />
                <Route path="/reproduction/abortions" element={<AbortedPregnanciesPage />} />
                <Route path="/reproduction/dryoffs" element={<DryoffsPage />} />

                {/* Lifecycle Events */}
                <Route path="/lifecycle/transfers" element={<TransfersPage />} />
                <Route path="/lifecycle/disposals" element={<DisposalsPage />} />
                <Route path="/lifecycle/weights" element={<WeightChangesPage />} />
                <Route path="/lifecycle/feedings" element={<FeedingsPage />} />
                <Route path="/lifecycle/milkings" element={<MilkingsPage />} />

                {/* Reference Data - Reproduction */}
                <Route path="/reference/birth-types" element={<BirthTypesPage />} />
                <Route path="/reference/birth-problems" element={<BirthProblemsPage />} />
                <Route path="/reference/calving-types" element={<CalvingTypesPage />} />
                <Route path="/reference/calving-problems" element={<CalvingProblemsPage />} />
                <Route path="/reference/heat-types" element={<HeatTypesPage />} />
                <Route path="/reference/semen-straw-types" element={<SemenStrawTypesPage />} />
                <Route path="/reference/insemination-services" element={<InseminationServicesPage />} />
                <Route path="/reference/reproductive-problems" element={<ReproductiveProblemsPage />} />

                {/* Reference Data - Lifecycle */}
                <Route path="/reference/disposal-types" element={<DisposalTypesPage />} />
                <Route path="/reference/feeding-types" element={<FeedingTypesPage />} />
                <Route path="/reference/milking-methods" element={<MilkingMethodsPage />} />

                {/* User Management */}
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/system" element={<SystemUsersPage />} />
                <Route path="/users/extension-officers" element={<ExtensionOfficersPage />} />
                <Route path="/users/vets" element={<VetsPage />} />
                <Route path="/users/farm-users" element={<FarmUsersPage />} />
                <Route path="/users/farm-invites" element={<ExtensionOfficerFarmInvitesPage />} />
                <Route path="/users/otp" element={<OtpVerificationsPage />} />

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
