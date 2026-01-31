# ✅ API Working Report

This report lists all functional API endpoints tested (Total Working: 133). The base URL `https://45.77.1.62.nip.io/api` has been omitted for clarity.

| Method | Endpoint Name | Relative Path |
| :--- | :--- | :--- |
| `POST` | Login (systemUser) | `/auth/login` |
| `GET` | Profile (current user) | `/auth/profile` |
| `GET` | List Extension Officer Farm Invites | `/v1/admin/entities/extension-officer-farm-invites` |
| `GET` | List Extension Officers | `/v1/admin/entities/extension-officers` |
| `GET` | List Farmers | `/v1/admin/entities/farmers` |
| `GET` | List Farms | `/v1/admin/entities/farms` |
| `GET` | List Livestock | `/v1/admin/entities/livestock` |
| `GET` | List Vaccines | `/v1/admin/entities/vaccines` |
| `GET` | List Vets | `/v1/admin/entities/vets` |
| `GET` | List Countries | `/v1/admin/locations/countries` |
| `POST` | Create Country | `/v1/admin/locations/countries` |
| `GET` | Get Country Details | `/v1/admin/locations/countries/12` |
| `PUT` | Update Country | `/v1/admin/locations/countries/12` |
| `DELETE` | Delete Country | `/v1/admin/locations/countries/12` |
| `GET` | List Districts | `/v1/admin/locations/districts` |
| `GET` | List Divisions | `/v1/admin/locations/divisions` |
| `GET` | List Regions | `/v1/admin/locations/regions` |
| `GET` | List Streets | `/v1/admin/locations/streets` |
| `GET` | List Villages | `/v1/admin/locations/villages` |
| `GET` | List Wards | `/v1/admin/locations/wards` |
| `GET` | List Aborted Pregnancies | `/v1/admin/logs/aborted-pregnancies` |
| `GET` | List Birth Events | `/v1/admin/logs/birth-events` |
| `GET` | List Dewormings | `/v1/admin/logs/dewormings` |
| `GET` | List Disposals | `/v1/admin/logs/disposals` |
| `GET` | List Dryoffs | `/v1/admin/logs/dryoffs` |
| `GET` | List Feedings | `/v1/admin/logs/feedings` |
| `GET` | List Inseminations | `/v1/admin/logs/inseminations` |
| `GET` | List Milkings | `/v1/admin/logs/milkings` |
| `GET` | List Pregnancies | `/v1/admin/logs/pregnancies` |
| `GET` | List Transfers | `/v1/admin/logs/transfers` |
| `GET` | List Treatments | `/v1/admin/logs/treatments` |
| `GET` | List Vaccinations | `/v1/admin/logs/vaccinations` |
| `GET` | List Weight Changes | `/v1/admin/logs/weight-changes` |
| `GET` | List Administration Routes | `/v1/admin/reference/administration-routes` |
| `POST` | Create Administration Route | `/v1/admin/reference/administration-routes` |
| `GET` | Get Administration Route Details | `/v1/admin/reference/administration-routes/13` |
| `PUT` | Update Administration Route | `/v1/admin/reference/administration-routes/13` |
| `DELETE` | Delete Administration Route | `/v1/admin/reference/administration-routes/13` |
| `GET` | List Birth Problems | `/v1/admin/reference/birth-problems` |
| `GET` | List Birth Types | `/v1/admin/reference/birth-types` |
| `GET` | List Breeds | `/v1/admin/reference/breeds` |
| `GET` | List Diseases | `/v1/admin/reference/diseases` |
| `POST` | Create Disease | `/v1/admin/reference/diseases` |
| `GET` | Get Disease Details | `/v1/admin/reference/diseases/43` |
| `PUT` | Update Disease | `/v1/admin/reference/diseases/43` |
| `DELETE` | Delete Disease | `/v1/admin/reference/diseases/43` |
| `GET` | List Disposal Types | `/v1/admin/reference/disposal-types` |
| `POST` | Create Disposal Type | `/v1/admin/reference/disposal-types` |
| `GET` | Get Disposal Type Details | `/v1/admin/reference/disposal-types/15` |
| `PUT` | Update Disposal Type | `/v1/admin/reference/disposal-types/15` |
| `DELETE` | Delete Disposal Type | `/v1/admin/reference/disposal-types/15` |
| `GET` | List Feeding Types | `/v1/admin/reference/feeding-types` |
| `POST` | Create Feeding Type | `/v1/admin/reference/feeding-types` |
| `GET` | Get Feeding Type Details | `/v1/admin/reference/feeding-types/19` |
| `PUT` | Update Feeding Type | `/v1/admin/reference/feeding-types/19` |
| `DELETE` | Delete Feeding Type | `/v1/admin/reference/feeding-types/19` |
| `GET` | List Heat Types | `/v1/admin/reference/heat-types` |
| `POST` | Create Heat Type | `/v1/admin/reference/heat-types` |
| `GET` | Get Heat Type Details | `/v1/admin/reference/heat-types/12` |
| `PUT` | Update Heat Type | `/v1/admin/reference/heat-types/12` |
| `DELETE` | Delete Heat Type | `/v1/admin/reference/heat-types/12` |
| `GET` | List Identity Card Types | `/v1/admin/reference/identity-card-types` |
| `POST` | Create Identity Card Type | `/v1/admin/reference/identity-card-types` |
| `GET` | Get Identity Card Type Details | `/v1/admin/reference/identity-card-types/13` |
| `PUT` | Update Identity Card Type | `/v1/admin/reference/identity-card-types/13` |
| `DELETE` | Delete Identity Card Type | `/v1/admin/reference/identity-card-types/13` |
| `GET` | List Insemination Services | `/v1/admin/reference/insemination-services` |
| `POST` | Create Insemination Service | `/v1/admin/reference/insemination-services` |
| `GET` | Get Insemination Service Details | `/v1/admin/reference/insemination-services/13` |
| `PUT` | Update Insemination Service | `/v1/admin/reference/insemination-services/13` |
| `DELETE` | Delete Insemination Service | `/v1/admin/reference/insemination-services/13` |
| `GET` | List Legal Statuses | `/v1/admin/reference/legal-statuses` |
| `POST` | Create Legal Status | `/v1/admin/reference/legal-statuses` |
| `GET` | Get Legal Status Details | `/v1/admin/reference/legal-statuses/14` |
| `PUT` | Update Legal Status | `/v1/admin/reference/legal-statuses/14` |
| `DELETE` | Delete Legal Status | `/v1/admin/reference/legal-statuses/14` |
| `GET` | List Livestock Obtained Methods | `/v1/admin/reference/livestock-obtained-methods` |
| `POST` | Create Livestock Obtained Method | `/v1/admin/reference/livestock-obtained-methods` |
| `GET` | Get Livestock Obtained Method Details | `/v1/admin/reference/livestock-obtained-methods/15` |
| `PUT` | Update Livestock Obtained Method | `/v1/admin/reference/livestock-obtained-methods/15` |
| `DELETE` | Delete Livestock Obtained Method | `/v1/admin/reference/livestock-obtained-methods/15` |
| `GET` | List Livestock Types | `/v1/admin/reference/livestock-types` |
| `POST` | Create Livestock Type | `/v1/admin/reference/livestock-types` |
| `GET` | Get Livestock Type Details | `/v1/admin/reference/livestock-types/16` |
| `PUT` | Update Livestock Type | `/v1/admin/reference/livestock-types/16` |
| `DELETE` | Delete Livestock Type | `/v1/admin/reference/livestock-types/16` |
| `GET` | List Medicine Types | `/v1/admin/reference/medicine-types` |
| `POST` | Create Medicine Type | `/v1/admin/reference/medicine-types` |
| `GET` | Get Medicine Type Details | `/v1/admin/reference/medicine-types/17` |
| `PUT` | Update Medicine Type | `/v1/admin/reference/medicine-types/17` |
| `DELETE` | Delete Medicine Type | `/v1/admin/reference/medicine-types/17` |
| `GET` | List Medicines | `/v1/admin/reference/medicines` |
| `POST` | Create Medicine | `/v1/admin/reference/medicines` |
| `GET` | Get Medicine Details | `/v1/admin/reference/medicines/30` |
| `PUT` | Update Medicine | `/v1/admin/reference/medicines/30` |
| `DELETE` | Delete Medicine | `/v1/admin/reference/medicines/30` |
| `GET` | List Milking Methods | `/v1/admin/reference/milking-methods` |
| `POST` | Create Milking Method | `/v1/admin/reference/milking-methods` |
| `GET` | Get Milking Method Details | `/v1/admin/reference/milking-methods/12` |
| `PUT` | Update Milking Method | `/v1/admin/reference/milking-methods/12` |
| `DELETE` | Delete Milking Method | `/v1/admin/reference/milking-methods/12` |
| `GET` | List Reproductive Problems | `/v1/admin/reference/reproductive-problems` |
| `POST` | Create Reproductive Problem | `/v1/admin/reference/reproductive-problems` |
| `GET` | Get Reproductive Problem Details | `/v1/admin/reference/reproductive-problems/19` |
| `PUT` | Update Reproductive Problem | `/v1/admin/reference/reproductive-problems/19` |
| `DELETE` | Delete Reproductive Problem | `/v1/admin/reference/reproductive-problems/19` |
| `GET` | List School Levels | `/v1/admin/reference/school-levels` |
| `POST` | Create School Level | `/v1/admin/reference/school-levels` |
| `GET` | Get School Level Details | `/v1/admin/reference/school-levels/14` |
| `PUT` | Update School Level | `/v1/admin/reference/school-levels/14` |
| `DELETE` | Delete School Level | `/v1/admin/reference/school-levels/14` |
| `GET` | List Semen Straw Types | `/v1/admin/reference/semen-straw-types` |
| `POST` | Create Semen Straw Type | `/v1/admin/reference/semen-straw-types` |
| `GET` | Get Semen Straw Type Details | `/v1/admin/reference/semen-straw-types/15` |
| `PUT` | Update Semen Straw Type | `/v1/admin/reference/semen-straw-types/15` |
| `DELETE` | Delete Semen Straw Type | `/v1/admin/reference/semen-straw-types/15` |
| `GET` | List Species | `/v1/admin/reference/species` |
| `GET` | List Stages | `/v1/admin/reference/stages` |
| `GET` | List Test Results | `/v1/admin/reference/test-results` |
| `POST` | Create Test Result | `/v1/admin/reference/test-results` |
| `GET` | Get Test Result Details | `/v1/admin/reference/test-results/13` |
| `PUT` | Update Test Result | `/v1/admin/reference/test-results/13` |
| `DELETE` | Delete Test Result | `/v1/admin/reference/test-results/13` |
| `GET` | List Vaccine Types | `/v1/admin/reference/vaccine-types` |
| `POST` | Create Vaccine Type | `/v1/admin/reference/vaccine-types` |
| `GET` | Get Vaccine Type Details | `/v1/admin/reference/vaccine-types/11` |
| `PUT` | Update Vaccine Type | `/v1/admin/reference/vaccine-types/11` |
| `DELETE` | Delete Vaccine Type | `/v1/admin/reference/vaccine-types/11` |
| `POST` | Create User | `/v1/admin/users` |
| `GET` | Get User Details | `/v1/admin/users/41` |
| `PUT` | Update User | `/v1/admin/users/41` |
| `GET` | User Statistics | `/v1/admin/users/statistics` |
| `GET` | List Users | `/v1/admin/users?active_only=true` |
