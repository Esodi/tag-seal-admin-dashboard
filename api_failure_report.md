# 📋 Comprehensive API Endpoint Failure Report

This report lists every single failing endpoint from the diagnostic test (Total Failing: 130). The base URL `https://45.77.1.62.nip.io/api` has been omitted for clarity.

## 🔥 Internal Server Errors (20)
| Method | Name | Path | Error |
| :--- | :--- | :--- | :--- |
| `DELETE` | Delete User | `/v1/admin/users/41` | Cannot delete system users |
| `POST` | Create Livestock | `/v1/admin/entities/livestock` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `POST` | Create Birth Event | `/v1/admin/logs/birth-events` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `POST` | Create Aborted Pregnancy | `/v1/admin/logs/aborted-pregnancies` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `POST` | Create Feeding | `/v1/admin/logs/feedings` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `POST` | Create Weight Change | `/v1/admin/logs/weight-changes` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `POST` | Create Deworming | `/v1/admin/logs/dewormings` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `POST` | Create Treatment | `/v1/admin/logs/treatments` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `POST` | Create Vaccination | `/v1/admin/logs/vaccinations` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `POST` | Create Disposal | `/v1/admin/logs/disposals` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `POST` | Create Milking | `/v1/admin/logs/milkings` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `POST` | Create Pregnancy | `/v1/admin/logs/pregnancies` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `POST` | Create Insemination | `/v1/admin/logs/inseminations` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `POST` | Create Dryoff | `/v1/admin/logs/dryoffs` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `POST` | Create Transfer | `/v1/admin/logs/transfers` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.livestock' doesn't exist |
| `GET` | List Calvings | `/v1/admin/logs/calvings` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.calvings' doesn't exist  |
| `POST` | Create Calving | `/v1/admin/logs/calvings` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.calvings' doesn't exist  |
| `GET` | Get Calving Details | `/v1/admin/logs/calvings/{{calvingId}}` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.calvings' doesn't exist  |
| `PUT` | Update Calving | `/v1/admin/logs/calvings/{{calvingId}}` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.calvings' doesn't exist  |
| `DELETE` | Delete Calving | `/v1/admin/logs/calvings/{{calvingId}}` | SQLSTATE[42S02]: Base table or view not found: 1146 Table 'tag_and_seal_new.calvings' doesn't exist  |

## ⚠️ Validation Failures (17)
| Method | Name | Path | Validation Errors |
| :--- | :--- | :--- | :--- |
| `POST` | Create Region | `/v1/admin/locations/regions` | `{'countryId': ['The selected country id is invalid.']}` |
| `POST` | Create District | `/v1/admin/locations/districts` | `{'regionId': ['The selected region id is invalid.']}` |
| `POST` | Create Ward | `/v1/admin/locations/wards` | `{'districtId': ['The selected district id is invalid.']}` |
| `POST` | Create Village | `/v1/admin/locations/villages` | `{'wardId': ['The selected ward id is invalid.']}` |
| `POST` | Create Street | `/v1/admin/locations/streets` | `{'wardId': ['The selected ward id is invalid.']}` |
| `POST` | Create Division | `/v1/admin/locations/divisions` | `{'districtId': ['The selected district id is invalid.']}` |
| `POST` | Create Birth Problem | `/v1/admin/reference/birth-problems` | `{'livestockTypeId': ['The selected livestock type id is invalid.']}` |
| `POST` | Create Birth Type | `/v1/admin/reference/birth-types` | `{'livestockTypeId': ['The selected livestock type id is invalid.']}` |
| `POST` | Create Breed | `/v1/admin/reference/breeds` | `{'livestockTypeId': ['The selected livestock type id is invalid.']}` |
| `POST` | Create Specie | `/v1/admin/reference/species` | `{'livestockTypeId': ['The selected livestock type id is invalid.']}` |
| `POST` | Create Stage | `/v1/admin/reference/stages` | `{'livestockTypeId': ['The selected livestock type id is invalid.']}` |
| `POST` | Create Extension Officer | `/v1/admin/entities/extension-officers` | `{'countryId': ['The selected country id is invalid.'], 'regionId': ['The selected region id is invalid.'], 'districtId': ['The selected district id is invalid.']}` |
| `POST` | Create Extension Officer Farm Invite | `/v1/admin/entities/extension-officer-farm-invites` | `{'extensionOfficerId': ['The selected extension officer id is invalid.'], 'farmerId': ['The selected farmer id is invalid.']}` |
| `POST` | Create Farmer | `/v1/admin/entities/farmers` | `{'countryId': ['The selected country id is invalid.']}` |
| `POST` | Create Farm | `/v1/admin/entities/farms` | `{'farmerId': ['The selected farmer id is invalid.'], 'size': ['The size field must be a string.'], 'countryId': ['The selected country id is invalid.']}` |
| `POST` | Create Vet | `/v1/admin/entities/vets` | `{'countryId': ['The selected country id is invalid.'], 'regionId': ['The selected region id is invalid.']}` |
| `POST` | Create Vaccine | `/v1/admin/entities/vaccines` | `{'farmUuid': ['The selected farm uuid is invalid.']}` |

## 🔍 Not Found / Missing (93)
| Method | Name | Path |
| :--- | :--- | :--- |
| `GET` | Get Region Details | `/v1/admin/locations/regions/1` |
| `PUT` | Update Region | `/v1/admin/locations/regions/1` |
| `DELETE` | Delete Region | `/v1/admin/locations/regions/1` |
| `GET` | Get District Details | `/v1/admin/locations/districts/1` |
| `PUT` | Update District | `/v1/admin/locations/districts/1` |
| `DELETE` | Delete District | `/v1/admin/locations/districts/1` |
| `GET` | Get Ward Details | `/v1/admin/locations/wards/1` |
| `PUT` | Update Ward | `/v1/admin/locations/wards/1` |
| `DELETE` | Delete Ward | `/v1/admin/locations/wards/1` |
| `GET` | Get Village Details | `/v1/admin/locations/villages/1` |
| `PUT` | Update Village | `/v1/admin/locations/villages/1` |
| `DELETE` | Delete Village | `/v1/admin/locations/villages/1` |
| `GET` | Get Street Details | `/v1/admin/locations/streets/1` |
| `PUT` | Update Street | `/v1/admin/locations/streets/1` |
| `DELETE` | Delete Street | `/v1/admin/locations/streets/1` |
| `GET` | Get Division Details | `/v1/admin/locations/divisions/1` |
| `PUT` | Update Division | `/v1/admin/locations/divisions/1` |
| `DELETE` | Delete Division | `/v1/admin/locations/divisions/1` |
| `GET` | Get Birth Problem Details | `/v1/admin/reference/birth-problems/{{birthProblemId}}` |
| `PUT` | Update Birth Problem | `/v1/admin/reference/birth-problems/{{birthProblemId}}` |
| `DELETE` | Delete Birth Problem | `/v1/admin/reference/birth-problems/{{birthProblemId}}` |
| `GET` | Get Birth Type Details | `/v1/admin/reference/birth-types/{{birthTypeId}}` |
| `PUT` | Update Birth Type | `/v1/admin/reference/birth-types/{{birthTypeId}}` |
| `DELETE` | Delete Birth Type | `/v1/admin/reference/birth-types/{{birthTypeId}}` |
| `GET` | Get Breed Details | `/v1/admin/reference/breeds/{{breedId}}` |
| `PUT` | Update Breed | `/v1/admin/reference/breeds/{{breedId}}` |
| `DELETE` | Delete Breed | `/v1/admin/reference/breeds/{{breedId}}` |
| `GET` | Get Specie Details | `/v1/admin/reference/species/{{specieId}}` |
| `PUT` | Update Specie | `/v1/admin/reference/species/{{specieId}}` |
| `DELETE` | Delete Specie | `/v1/admin/reference/species/{{specieId}}` |
| `GET` | Get Stage Details | `/v1/admin/reference/stages/{{stageId}}` |
| `PUT` | Update Stage | `/v1/admin/reference/stages/{{stageId}}` |
| `DELETE` | Delete Stage | `/v1/admin/reference/stages/{{stageId}}` |
| `GET` | Get Extension Officer Details | `/v1/admin/entities/extension-officers/{{extensionOfficerId}}` |
| `PUT` | Update Extension Officer | `/v1/admin/entities/extension-officers/{{extensionOfficerId}}` |
| `DELETE` | Delete Extension Officer | `/v1/admin/entities/extension-officers/{{extensionOfficerId}}` |
| `GET` | Get Extension Officer Farm Invite Details | `/v1/admin/entities/extension-officer-farm-invites/{{extensionOfficerFarmInviteId}}` |
| `PUT` | Update Extension Officer Farm Invite | `/v1/admin/entities/extension-officer-farm-invites/{{extensionOfficerFarmInviteId}}` |
| `DELETE` | Delete Extension Officer Farm Invite | `/v1/admin/entities/extension-officer-farm-invites/{{extensionOfficerFarmInviteId}}` |
| `GET` | Get Farmer Details | `/v1/admin/entities/farmers/1` |
| `PUT` | Update Farmer | `/v1/admin/entities/farmers/1` |
| `DELETE` | Delete Farmer | `/v1/admin/entities/farmers/1` |
| `GET` | Get Farm Details | `/v1/admin/entities/farms/1` |
| `PUT` | Update Farm | `/v1/admin/entities/farms/1` |
| `DELETE` | Delete Farm | `/v1/admin/entities/farms/1` |
| `GET` | Get Livestock Details | `/v1/admin/entities/livestock/{{livestockId}}` |
| `PUT` | Update Livestock | `/v1/admin/entities/livestock/{{livestockId}}` |
| `DELETE` | Delete Livestock | `/v1/admin/entities/livestock/{{livestockId}}` |
| `GET` | Get Vet Details | `/v1/admin/entities/vets/1` |
| `PUT` | Update Vet | `/v1/admin/entities/vets/1` |
| `DELETE` | Delete Vet | `/v1/admin/entities/vets/1` |
| `GET` | Get Vaccine Details | `/v1/admin/entities/vaccines/{{vaccineId}}` |
| `PUT` | Update Vaccine | `/v1/admin/entities/vaccines/{{vaccineId}}` |
| `DELETE` | Delete Vaccine | `/v1/admin/entities/vaccines/{{vaccineId}}` |
| `GET` | Get Birth Event Details | `/v1/admin/logs/birth-events/{{birthEventId}}` |
| `PUT` | Update Birth Event | `/v1/admin/logs/birth-events/{{birthEventId}}` |
| `DELETE` | Delete Birth Event | `/v1/admin/logs/birth-events/{{birthEventId}}` |
| `GET` | Get Aborted Pregnancy Details | `/v1/admin/logs/aborted-pregnancies/{{abortedPregnancyId}}` |
| `PUT` | Update Aborted Pregnancy | `/v1/admin/logs/aborted-pregnancies/{{abortedPregnancyId}}` |
| `DELETE` | Delete Aborted Pregnancy | `/v1/admin/logs/aborted-pregnancies/{{abortedPregnancyId}}` |
| `GET` | Get Feeding Details | `/v1/admin/logs/feedings/{{feedingId}}` |
| `PUT` | Update Feeding | `/v1/admin/logs/feedings/{{feedingId}}` |
| `DELETE` | Delete Feeding | `/v1/admin/logs/feedings/{{feedingId}}` |
| `GET` | Get Weight Change Details | `/v1/admin/logs/weight-changes/{{weightChangeId}}` |
| `PUT` | Update Weight Change | `/v1/admin/logs/weight-changes/{{weightChangeId}}` |
| `DELETE` | Delete Weight Change | `/v1/admin/logs/weight-changes/{{weightChangeId}}` |
| `GET` | Get Deworming Details | `/v1/admin/logs/dewormings/{{dewormingId}}` |
| `PUT` | Update Deworming | `/v1/admin/logs/dewormings/{{dewormingId}}` |
| `DELETE` | Delete Deworming | `/v1/admin/logs/dewormings/{{dewormingId}}` |
| `GET` | Get Treatment Details | `/v1/admin/logs/treatments/{{treatmentId}}` |
| `PUT` | Update Treatment | `/v1/admin/logs/treatments/{{treatmentId}}` |
| `DELETE` | Delete Treatment | `/v1/admin/logs/treatments/{{treatmentId}}` |
| `GET` | Get Vaccination Details | `/v1/admin/logs/vaccinations/{{vaccinationId}}` |
| `PUT` | Update Vaccination | `/v1/admin/logs/vaccinations/{{vaccinationId}}` |
| `DELETE` | Delete Vaccination | `/v1/admin/logs/vaccinations/{{vaccinationId}}` |
| `GET` | Get Disposal Details | `/v1/admin/logs/disposals/{{disposalId}}` |
| `PUT` | Update Disposal | `/v1/admin/logs/disposals/{{disposalId}}` |
| `DELETE` | Delete Disposal | `/v1/admin/logs/disposals/{{disposalId}}` |
| `GET` | Get Milking Details | `/v1/admin/logs/milkings/{{milkingId}}` |
| `PUT` | Update Milking | `/v1/admin/logs/milkings/{{milkingId}}` |
| `DELETE` | Delete Milking | `/v1/admin/logs/milkings/{{milkingId}}` |
| `GET` | Get Pregnancy Details | `/v1/admin/logs/pregnancies/{{pregnancyId}}` |
| `PUT` | Update Pregnancy | `/v1/admin/logs/pregnancies/{{pregnancyId}}` |
| `DELETE` | Delete Pregnancy | `/v1/admin/logs/pregnancies/{{pregnancyId}}` |
| `GET` | Get Insemination Details | `/v1/admin/logs/inseminations/{{inseminationId}}` |
| `PUT` | Update Insemination | `/v1/admin/logs/inseminations/{{inseminationId}}` |
| `DELETE` | Delete Insemination | `/v1/admin/logs/inseminations/{{inseminationId}}` |
| `GET` | Get Dryoff Details | `/v1/admin/logs/dryoffs/{{dryoffId}}` |
| `PUT` | Update Dryoff | `/v1/admin/logs/dryoffs/{{dryoffId}}` |
| `DELETE` | Delete Dryoff | `/v1/admin/logs/dryoffs/{{dryoffId}}` |
| `GET` | Get Transfer Details | `/v1/admin/logs/transfers/{{transferId}}` |
| `PUT` | Update Transfer | `/v1/admin/logs/transfers/{{transferId}}` |
| `DELETE` | Delete Transfer | `/v1/admin/logs/transfers/{{transferId}}` |

