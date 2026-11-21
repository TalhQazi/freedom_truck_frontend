# Freedom Car & Truck – Frontend Application

Production-ready web client for **Freedom Car & Truck** Automotive Workshop Management System.

## Architecture

- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS with custom high-contrast automotive workshop theme
- **Icons**: Lucide React
- **Routing**: React Router DOM v6 with role-protected layouts
- **State & Auth**: React Context (`AuthContext`) with instant role-switching dropdown for all 6 employee roles

## Modules

- Role Dashboards (Admin, Manager, Service Writer, Tech #1, QC Tech #2, Office Assistant)
- Customers & Commercial Fleet Registry (SW-001)
- Vehicle Registration & Service History (SW-002)
- Line Item Estimates with Live Parts Matrix & Flat Tire Markup (SW-003, SW-004, SW-005)
- Customer Digital Authorization with Touch/Mouse Canvas Signature (SW-007)
- 50% Deposit Collection Gate (> $500.00) (SW-008)
- Repair Orders & Technician Dispatch (SW-006, SW-009)
- Technician Worksheets (TECH-001 through TECH-013)
  - 2-person lighting inspection (TECH-002)
  - 5-point lift safety verification (TECH-003)
  - Multi-point inspection with Green/Yellow/Red grading (TECH-004, TECH-005)
  - Dual distinct technician signoffs (Tech #1 initial signoff TECH-008 & Independent QC Tech #2 signoff TECH-009/011)
  - Vehicle exit roll-out observation (TECH-012)
  - Service writer final release verification (SW-010)
- Invoicing with Automatic Deposit Credit (SW-011)
- Payment Settlement (SW-012) & Dual Receipts with Office Archival Signature (SW-013)
- Daily Cash-Up Register Reconciliation ($100 exact float) (SW-015)
- Office Security Walkthrough Checklists & Computer Modification Requests (OFF-001 through OFF-012)
- Operational Reports & Immutable Audit Trail

## Development & Build

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```
