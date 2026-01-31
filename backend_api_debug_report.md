# 🛠️ Backend API Debugging Report

This report is specifically generated for the backend developer to identify and fix endpoint failures. The base URL `https://45.77.1.62.nip.io/api` has been removed from paths for clarity.

**Total Failures:** 130

## 🔥 Internal Server Errors (500)
These typically indicate database issues, missing models, or unhandled exceptions in php code.

| Method | Endpoint Name | Relative Path | Error Details |
| :--- | :--- | :--- | :--- |
| `DELETE` | Delete User | `Admin - Users/Delete User` | Cannot delete system users |
| `POST` | Create Livestock | `Admin - Entities/Livestock/Create Livestock` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `POST` | Create Birth Event | `Admin - Logs/Birth Events/Create Birth Event` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `POST` | Create Aborted Pregnancy | `Admin - Logs/Aborted Pregnancies/Create Aborted Pregnancy` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `POST` | Create Feeding | `Admin - Logs/Feedings/Create Feeding` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `POST` | Create Weight Change | `Admin - Logs/Weight Changes/Create Weight Change` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `POST` | Create Deworming | `Admin - Logs/Dewormings/Create Deworming` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `POST` | Create Treatment | `Admin - Logs/Treatments (Medications)/Create Treatment` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `POST` | Create Vaccination | `Admin - Logs/Vaccinations/Create Vaccination` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `POST` | Create Disposal | `Admin - Logs/Disposals/Create Disposal` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `POST` | Create Milking | `Admin - Logs/Milkings/Create Milking` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `POST` | Create Pregnancy | `Admin - Logs/Pregnancies/Create Pregnancy` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `POST` | Create Insemination | `Admin - Logs/Inseminations/Create Insemination` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `POST` | Create Dryoff | `Admin - Logs/Dryoffs/Create Dryoff` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `POST` | Create Transfer | `Admin - Logs/Transfers/Create Transfer` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `livestock` where `uuid` = livestock-uuid-456) |
| `GET` | List Calvings | `Admin - Logs/Calvings/List Calvings` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.calvings' doesn't exist (Connection: mysql, SQL: select * from `calvings` order by `created_at` desc) |
| `POST` | Create Calving | `Admin - Logs/Calvings/Create Calving` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.calvings' doesn't exist (Connection: mysql, SQL: select count(*) as aggregate from `calvings` where `uuid` = calving-uuid-123) |
| `GET` | Get Calving Details | `Admin - Logs/Calvings/Get Calving Details` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.calvings' doesn't exist (Connection: mysql, SQL: select * from `calvings` where `id` = {{calvingId}} limit 1) |
| `PUT` | Update Calving | `Admin - Logs/Calvings/Update Calving` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.calvings' doesn't exist (Connection: mysql, SQL: select * from `calvings` where `id` = {{calvingId}} limit 1) |
| `DELETE` | Delete Calving | `Admin - Logs/Calvings/Delete Calving` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.calvings' doesn't exist (Connection: mysql, SQL: select * from `calvings` where `id` = {{calvingId}} limit 1) |

---

## ⚠️ Validation Errors (422)
These indicate that the backend rejected the data. This might be due to broken foreign key constraints or outdated validation rules.

| Method | Endpoint Name | Relative Path | Error Details |
| :--- | :--- | :--- | :--- |
| `POST` | Create Region | `Admin - Regions/Create Region` | Validation failed |
| `POST` | Create District | `Admin - Districts/Create District` | Validation failed |
| `POST` | Create Ward | `Admin - Wards/Create Ward` | Validation failed |
| `POST` | Create Village | `Admin - Villages/Create Village` | Validation failed |
| `POST` | Create Street | `Admin - Streets/Create Street` | Validation failed |
| `POST` | Create Division | `Admin - Divisions/Create Division` | Validation failed |
| `POST` | Create Birth Problem | `Admin - Reference Data/Birth Problems/Create Birth Problem` | Validation failed |
| `POST` | Create Birth Type | `Admin - Reference Data/Birth Types/Create Birth Type` | Validation failed |
| `POST` | Create Breed | `Admin - Reference Data/Breeds/Create Breed` | Validation failed |
| `POST` | Create Specie | `Admin - Reference Data/Species/Create Specie` | Validation failed |
| `POST` | Create Stage | `Admin - Reference Data/Stages/Create Stage` | Validation failed |
| `POST` | Create Extension Officer | `Admin - Entities/Extension Officers/Create Extension Officer` | Validation failed |
| `POST` | Create Extension Officer Farm Invite | `Admin - Entities/Extension Officer Farm Invites/Create Extension Officer Farm Invite` | Validation failed |
| `POST` | Create Farmer | `Admin - Entities/Farmers/Create Farmer` | Validation failed |
| `POST` | Create Farm | `Admin - Entities/Farms/Create Farm` | Validation failed |
| `POST` | Create Vet | `Admin - Entities/Vets/Create Vet` | Validation failed |
| `POST` | Create Vaccine | `Admin - Entities/Vaccines/Create Vaccine` | Validation failed |

---

## 🚫 Not Found (404)
The endpoint path or a specific resource ID was not found on the server.

| Method | Endpoint Name | Relative Path | Error Details |
| :--- | :--- | :--- | :--- |
| `GET` | Get Region Details | `Admin - Regions/Get Region Details` | No query results for model [App\Models\Region] 1 |
| `PUT` | Update Region | `Admin - Regions/Update Region` | No query results for model [App\Models\Region] 1 |
| `DELETE` | Delete Region | `Admin - Regions/Delete Region` | No query results for model [App\Models\Region] 1 |
| `GET` | Get District Details | `Admin - Districts/Get District Details` | No query results for model [App\Models\District] 1 |
| `PUT` | Update District | `Admin - Districts/Update District` | No query results for model [App\Models\District] 1 |
| `DELETE` | Delete District | `Admin - Districts/Delete District` | No query results for model [App\Models\District] 1 |
| `GET` | Get Ward Details | `Admin - Wards/Get Ward Details` | No query results for model [App\Models\Ward] 1 |
| `PUT` | Update Ward | `Admin - Wards/Update Ward` | No query results for model [App\Models\Ward] 1 |
| `DELETE` | Delete Ward | `Admin - Wards/Delete Ward` | No query results for model [App\Models\Ward] 1 |
| `GET` | Get Village Details | `Admin - Villages/Get Village Details` | No query results for model [App\Models\Village] 1 |
| `PUT` | Update Village | `Admin - Villages/Update Village` | No query results for model [App\Models\Village] 1 |
| `DELETE` | Delete Village | `Admin - Villages/Delete Village` | No query results for model [App\Models\Village] 1 |
| `GET` | Get Street Details | `Admin - Streets/Get Street Details` | No query results for model [App\Models\Street] 1 |
| `PUT` | Update Street | `Admin - Streets/Update Street` | No query results for model [App\Models\Street] 1 |
| `DELETE` | Delete Street | `Admin - Streets/Delete Street` | No query results for model [App\Models\Street] 1 |
| `GET` | Get Division Details | `Admin - Divisions/Get Division Details` | No query results for model [App\Models\Division] 1 |
| `PUT` | Update Division | `Admin - Divisions/Update Division` | No query results for model [App\Models\Division] 1 |
| `DELETE` | Delete Division | `Admin - Divisions/Delete Division` | No query results for model [App\Models\Division] 1 |
| `GET` | Get Birth Problem Details | `Admin - Reference Data/Birth Problems/Get Birth Problem Details` | No query results for model [App\Models\BirthProblem] {{birthProblemId}} |
| `PUT` | Update Birth Problem | `Admin - Reference Data/Birth Problems/Update Birth Problem` | No query results for model [App\Models\BirthProblem] {{birthProblemId}} |
| `DELETE` | Delete Birth Problem | `Admin - Reference Data/Birth Problems/Delete Birth Problem` | No query results for model [App\Models\BirthProblem] {{birthProblemId}} |
| `GET` | Get Birth Type Details | `Admin - Reference Data/Birth Types/Get Birth Type Details` | No query results for model [App\Models\BirthType] {{birthTypeId}} |
| `PUT` | Update Birth Type | `Admin - Reference Data/Birth Types/Update Birth Type` | No query results for model [App\Models\BirthType] {{birthTypeId}} |
| `DELETE` | Delete Birth Type | `Admin - Reference Data/Birth Types/Delete Birth Type` | No query results for model [App\Models\BirthType] {{birthTypeId}} |
| `GET` | Get Breed Details | `Admin - Reference Data/Breeds/Get Breed Details` | No query results for model [App\Models\Breed] {{breedId}} |
| `PUT` | Update Breed | `Admin - Reference Data/Breeds/Update Breed` | No query results for model [App\Models\Breed] {{breedId}} |
| `DELETE` | Delete Breed | `Admin - Reference Data/Breeds/Delete Breed` | No query results for model [App\Models\Breed] {{breedId}} |
| `GET` | Get Specie Details | `Admin - Reference Data/Species/Get Specie Details` | No query results for model [App\Models\Specie] {{specieId}} |
| `PUT` | Update Specie | `Admin - Reference Data/Species/Update Specie` | No query results for model [App\Models\Specie] {{specieId}} |
| `DELETE` | Delete Specie | `Admin - Reference Data/Species/Delete Specie` | No query results for model [App\Models\Specie] {{specieId}} |
| `GET` | Get Stage Details | `Admin - Reference Data/Stages/Get Stage Details` | No query results for model [App\Models\Stage] {{stageId}} |
| `PUT` | Update Stage | `Admin - Reference Data/Stages/Update Stage` | No query results for model [App\Models\Stage] {{stageId}} |
| `DELETE` | Delete Stage | `Admin - Reference Data/Stages/Delete Stage` | No query results for model [App\Models\Stage] {{stageId}} |
| `GET` | Get Extension Officer Details | `Admin - Entities/Extension Officers/Get Extension Officer Details` | No query results for model [App\Models\ExtensionOfficer] {{extensionOfficerId}} |
| `PUT` | Update Extension Officer | `Admin - Entities/Extension Officers/Update Extension Officer` | No query results for model [App\Models\ExtensionOfficer] {{extensionOfficerId}} |
| `DELETE` | Delete Extension Officer | `Admin - Entities/Extension Officers/Delete Extension Officer` | No query results for model [App\Models\ExtensionOfficer] {{extensionOfficerId}} |
| `GET` | Get Extension Officer Farm Invite Details | `Admin - Entities/Extension Officer Farm Invites/Get Extension Officer Farm Invite Details` | No query results for model [App\Models\ExtensionOfficerFarmInvite] {{extensionOfficerFarmInviteId}} |
| `PUT` | Update Extension Officer Farm Invite | `Admin - Entities/Extension Officer Farm Invites/Update Extension Officer Farm Invite` | No query results for model [App\Models\ExtensionOfficerFarmInvite] {{extensionOfficerFarmInviteId}} |
| `DELETE` | Delete Extension Officer Farm Invite | `Admin - Entities/Extension Officer Farm Invites/Delete Extension Officer Farm Invite` | No query results for model [App\Models\ExtensionOfficerFarmInvite] {{extensionOfficerFarmInviteId}} |
| `GET` | Get Farmer Details | `Admin - Entities/Farmers/Get Farmer Details` | No query results for model [App\Models\Farmer] 1 |
| `PUT` | Update Farmer | `Admin - Entities/Farmers/Update Farmer` | No query results for model [App\Models\Farmer] 1 |
| `DELETE` | Delete Farmer | `Admin - Entities/Farmers/Delete Farmer` | No query results for model [App\Models\Farmer] 1 |
| `GET` | Get Farm Details | `Admin - Entities/Farms/Get Farm Details` | No query results for model [App\Models\Farm] 1 |
| `PUT` | Update Farm | `Admin - Entities/Farms/Update Farm` | No query results for model [App\Models\Farm] 1 |
| `DELETE` | Delete Farm | `Admin - Entities/Farms/Delete Farm` | No query results for model [App\Models\Farm] 1 |
| `GET` | Get Livestock Details | `Admin - Entities/Livestock/Get Livestock Details` | No query results for model [App\Models\Livestock] {{livestockId}} |
| `PUT` | Update Livestock | `Admin - Entities/Livestock/Update Livestock` | No query results for model [App\Models\Livestock] {{livestockId}} |
| `DELETE` | Delete Livestock | `Admin - Entities/Livestock/Delete Livestock` | No query results for model [App\Models\Livestock] {{livestockId}} |
| `GET` | Get Vet Details | `Admin - Entities/Vets/Get Vet Details` | No query results for model [App\Models\Vet] 1 |
| `PUT` | Update Vet | `Admin - Entities/Vets/Update Vet` | No query results for model [App\Models\Vet] 1 |
| `DELETE` | Delete Vet | `Admin - Entities/Vets/Delete Vet` | No query results for model [App\Models\Vet] 1 |
| `GET` | Get Vaccine Details | `Admin - Entities/Vaccines/Get Vaccine Details` | No query results for model [App\Models\Vaccine] {{vaccineId}} |
| `PUT` | Update Vaccine | `Admin - Entities/Vaccines/Update Vaccine` | No query results for model [App\Models\Vaccine] {{vaccineId}} |
| `DELETE` | Delete Vaccine | `Admin - Entities/Vaccines/Delete Vaccine` | No query results for model [App\Models\Vaccine] {{vaccineId}} |
| `GET` | Get Birth Event Details | `Admin - Logs/Birth Events/Get Birth Event Details` | No query results for model [App\Models\BirthEvent] {{birthEventId}} |
| `PUT` | Update Birth Event | `Admin - Logs/Birth Events/Update Birth Event` | No query results for model [App\Models\BirthEvent] {{birthEventId}} |
| `DELETE` | Delete Birth Event | `Admin - Logs/Birth Events/Delete Birth Event` | No query results for model [App\Models\BirthEvent] {{birthEventId}} |
| `GET` | Get Aborted Pregnancy Details | `Admin - Logs/Aborted Pregnancies/Get Aborted Pregnancy Details` | No query results for model [App\Models\AbortedPregnancy] {{abortedPregnancyId}} |
| `PUT` | Update Aborted Pregnancy | `Admin - Logs/Aborted Pregnancies/Update Aborted Pregnancy` | No query results for model [App\Models\AbortedPregnancy] {{abortedPregnancyId}} |
| `DELETE` | Delete Aborted Pregnancy | `Admin - Logs/Aborted Pregnancies/Delete Aborted Pregnancy` | No query results for model [App\Models\AbortedPregnancy] {{abortedPregnancyId}} |
| `GET` | Get Feeding Details | `Admin - Logs/Feedings/Get Feeding Details` | No query results for model [App\Models\Feeding] {{feedingId}} |
| `PUT` | Update Feeding | `Admin - Logs/Feedings/Update Feeding` | No query results for model [App\Models\Feeding] {{feedingId}} |
| `DELETE` | Delete Feeding | `Admin - Logs/Feedings/Delete Feeding` | No query results for model [App\Models\Feeding] {{feedingId}} |
| `GET` | Get Weight Change Details | `Admin - Logs/Weight Changes/Get Weight Change Details` | No query results for model [App\Models\WeightChange] {{weightChangeId}} |
| `PUT` | Update Weight Change | `Admin - Logs/Weight Changes/Update Weight Change` | No query results for model [App\Models\WeightChange] {{weightChangeId}} |
| `DELETE` | Delete Weight Change | `Admin - Logs/Weight Changes/Delete Weight Change` | No query results for model [App\Models\WeightChange] {{weightChangeId}} |
| `GET` | Get Deworming Details | `Admin - Logs/Dewormings/Get Deworming Details` | No query results for model [App\Models\Deworming] {{dewormingId}} |
| `PUT` | Update Deworming | `Admin - Logs/Dewormings/Update Deworming` | No query results for model [App\Models\Deworming] {{dewormingId}} |
| `DELETE` | Delete Deworming | `Admin - Logs/Dewormings/Delete Deworming` | No query results for model [App\Models\Deworming] {{dewormingId}} |
| `GET` | Get Treatment Details | `Admin - Logs/Treatments (Medications)/Get Treatment Details` | No query results for model [App\Models\Treatment] {{treatmentId}} |
| `PUT` | Update Treatment | `Admin - Logs/Treatments (Medications)/Update Treatment` | No query results for model [App\Models\Treatment] {{treatmentId}} |
| `DELETE` | Delete Treatment | `Admin - Logs/Treatments (Medications)/Delete Treatment` | No query results for model [App\Models\Treatment] {{treatmentId}} |
| `GET` | Get Vaccination Details | `Admin - Logs/Vaccinations/Get Vaccination Details` | No query results for model [App\Models\Vaccination] {{vaccinationId}} |
| `PUT` | Update Vaccination | `Admin - Logs/Vaccinations/Update Vaccination` | No query results for model [App\Models\Vaccination] {{vaccinationId}} |
| `DELETE` | Delete Vaccination | `Admin - Logs/Vaccinations/Delete Vaccination` | No query results for model [App\Models\Vaccination] {{vaccinationId}} |
| `GET` | Get Disposal Details | `Admin - Logs/Disposals/Get Disposal Details` | No query results for model [App\Models\Disposal] {{disposalId}} |
| `PUT` | Update Disposal | `Admin - Logs/Disposals/Update Disposal` | No query results for model [App\Models\Disposal] {{disposalId}} |
| `DELETE` | Delete Disposal | `Admin - Logs/Disposals/Delete Disposal` | No query results for model [App\Models\Disposal] {{disposalId}} |
| `GET` | Get Milking Details | `Admin - Logs/Milkings/Get Milking Details` | No query results for model [App\Models\Milking] {{milkingId}} |
| `PUT` | Update Milking | `Admin - Logs/Milkings/Update Milking` | No query results for model [App\Models\Milking] {{milkingId}} |
| `DELETE` | Delete Milking | `Admin - Logs/Milkings/Delete Milking` | No query results for model [App\Models\Milking] {{milkingId}} |
| `GET` | Get Pregnancy Details | `Admin - Logs/Pregnancies/Get Pregnancy Details` | No query results for model [App\Models\Pregnancy] {{pregnancyId}} |
| `PUT` | Update Pregnancy | `Admin - Logs/Pregnancies/Update Pregnancy` | No query results for model [App\Models\Pregnancy] {{pregnancyId}} |
| `DELETE` | Delete Pregnancy | `Admin - Logs/Pregnancies/Delete Pregnancy` | No query results for model [App\Models\Pregnancy] {{pregnancyId}} |
| `GET` | Get Insemination Details | `Admin - Logs/Inseminations/Get Insemination Details` | No query results for model [App\Models\Insemination] {{inseminationId}} |
| `PUT` | Update Insemination | `Admin - Logs/Inseminations/Update Insemination` | No query results for model [App\Models\Insemination] {{inseminationId}} |
| `DELETE` | Delete Insemination | `Admin - Logs/Inseminations/Delete Insemination` | No query results for model [App\Models\Insemination] {{inseminationId}} |
| `GET` | Get Dryoff Details | `Admin - Logs/Dryoffs/Get Dryoff Details` | No query results for model [App\Models\Dryoff] {{dryoffId}} |
| `PUT` | Update Dryoff | `Admin - Logs/Dryoffs/Update Dryoff` | No query results for model [App\Models\Dryoff] {{dryoffId}} |
| `DELETE` | Delete Dryoff | `Admin - Logs/Dryoffs/Delete Dryoff` | No query results for model [App\Models\Dryoff] {{dryoffId}} |
| `GET` | Get Transfer Details | `Admin - Logs/Transfers/Get Transfer Details` | No query results for model [App\Models\Transfer] {{transferId}} |
| `PUT` | Update Transfer | `Admin - Logs/Transfers/Update Transfer` | No query results for model [App\Models\Transfer] {{transferId}} |
| `DELETE` | Delete Transfer | `Admin - Logs/Transfers/Delete Transfer` | No query results for model [App\Models\Transfer] {{transferId}} |

---

