# RiskManagement

A full-stack CAP (Cloud Application Programming Model) application built on SAP BTP Trial.

**Dev Space Type:** `Full-Stack Application Using Productivity Tools` (SAP Business Application Studio)

This project was built using the graphical tools exclusive to this Dev Space type — **Storyboard**, **Page Editor**, **Service Center**, and **Run Configurations** — with minimal manual CDS/JS coding. It represents the "low-code / guided development" approach to CAP application development on BTP.

> This is **not** a standard `Full Stack Cloud Application` Dev Space project. The `Full-Stack Application Using Productivity Tools` Dev Space provides additional graphical tooling (Storyboard, visual data modeling, Page Editor) on top of the standard CAP CLI tools.

---

## Overview

This application manages business risks and their mitigations, with integration to the SAP S/4HANA Business Partner API via SAP Business Accelerator Hub (sandbox).

### Key Features

- Risk management with draft-enabled CRUD (Create, Read, Update, Delete)
- Mitigation tracking linked to risks
- Business Partner (Supplier) lookup via SAP S/4HANA Cloud Public Edition API
- SAP Fiori Elements UI (auto-generated)
- OData v4 service with draft support

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              SAP BTP Trial (ap21 / Singapore)        │
│                                                     │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │  Fiori UI    │───▶│  CAP OData v4 Service    │   │
│  │ (SAPUI5)     │    │  RiskManagementService   │   │
│  └──────────────┘    └──────────┬───────────────┘   │
│                                 │                   │
│                    ┌────────────┴──────────────┐    │
│                    │      SQLite (local dev)    │    │
│                    │  Risks / Mitigations       │    │
│                    └───────────────────────────-┘    │
│                                 │                   │
│                    ┌────────────▼───────────────┐    │
│                    │  Remote: API_BUSINESS_      │    │
│                    │  PARTNER (OData v2)         │    │
│                    │  via apihub_sandbox dest.   │    │
│                    └────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                              │
                              ▼
              SAP Business Accelerator Hub (Sandbox)
              https://sandbox.api.sap.com
```

---

## Project Structure

```
risks-manage/
├── app/
│   └── risks/              # Fiori Elements UI app
│       ├── annotations.cds # UI annotations (Value Help, Labels)
│       └── webapp/
├── db/
│   └── schema.cds          # Domain model (Risks, Mitigations)
├── srv/
│   ├── service.cds         # OData service definition
│   ├── risk-service.js     # Remote service handler (Business Partner)
│   └── external/
│       └── API_BUSINESS_PARTNER.cds  # Imported external API metadata
├── env/
│   ├── .env1               # Local mock run config
│   └── .env2               # Live Data run config (apihub_sandbox)
├── test/data/
│   ├── RiskManagement-Risks.csv
│   └── RiskManagement-Mitigations.csv
└── package.json
```

---

## Data Model

### Risks
| Field | Type | Description |
|---|---|---|
| ID | UUID (key) | Unique identifier |
| title | String(100) | Risk title |
| prio | String(5) | Priority (H/M/L) |
| descr | String(100) | Description |
| impact | Integer | Impact score |
| criticality | Integer | Criticality score |
| miti | Association | Linked mitigation |
| supplier | Association | Linked Business Partner (external) |

### Mitigations
| Field | Type | Description |
|---|---|---|
| ID | UUID (key) | Unique identifier |
| description | String(100) | Mitigation description |
| owner | String(100) | Owner |
| timeline | String(100) | Timeline |
| risks | Association | Linked risks |

---

## External Service Integration

This project integrates with the **SAP S/4HANA Business Partner API (API_BUSINESS_PARTNER)** via SAP Business Accelerator Hub sandbox.

### How it works

1. `API_BUSINESS_PARTNER.edmx` was imported using `cds import` CLI
2. A manual remote service handler (`srv/risk-service.js`) forwards READ requests to the external OData v2 service:

```js
const cds = require('@sap/cds')

module.exports = cds.service.impl(async function() {
  const bupa = await cds.connect.to('API_BUSINESS_PARTNER')
  const { A_BusinessPartner } = this.entities

  this.on('READ', A_BusinessPartner, req => bupa.run(req.query))
})
```

3. BTP Destination `apihub_sandbox` is configured with:
   - URL: `https://sandbox.api.sap.com`
   - Authentication: `NoAuthentication`
   - Additional Property: `URL.headers.APIKey` = `<your API key from api.sap.com>`

> **Note:** The API Key must be obtained from [SAP Business Accelerator Hub](https://api.sap.com) after login. The property name is case-sensitive: `URL.headers.APIKey` (not `ApiKey`).

---

## Prerequisites

- SAP BTP Trial account
- SAP Business Application Studio subscription
- SAP HANA Cloud (hana-free) instance *(for production deployment)*
- SAP Business Accelerator Hub account (free) for API Key

---

## Development Environment

| Item | Detail |
|---|---|
| BAS Dev Space Type | Full-Stack Application Using Productivity Tools |
| Project Template | Full-Stack Node |
| Graphical Tools Used | Storyboard, Page Editor, Service Center |
| CAP version | @sap/cds 9.9.2 |
| BTP Region | ap21 (Singapore / Azure) |

## Local Development

### Run with Mock Data

```bash
cds watch
```

### Run with Live Data (Business Partner API)

Use the **"Run RiskManagement with Live Data"** Run Configuration in SAP BAS, which loads `env/.env2` and activates the `apihub_sandbox` destination proxy.

---

## Known Issues / Lessons Learned

**`cds import` vs Service Center graphical import**

When using `cds import` CLI instead of the BAS Service Center UI, the remote service handler file is **not** auto-generated. You must manually create `srv/risk-service.js` to forward READ requests to the external service. Without this, CAP reports:

```
Entity is annotated with "@cds.persistence.skip" and cannot be served generically.
501 Not Implemented
```

**API Key property name is case-sensitive**

In BTP Destination Additional Properties:
- ❌ `URL.headers.ApiKey`
- ✅ `URL.headers.APIKey`

---

## Learning Reference

Built following the SAP Learning course:
[Develop Cloud Applications Using SAP Business Application Studio](https://learning.sap.com/courses/develop-cloud-applications-using-sap-business-application-studio)
