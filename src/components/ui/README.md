# Tag & Seal UI foundation

All reusable admin UI primitives live in this directory and are exported by `index.ts`.

## Resource dashboard layout standard

Farm Invites is the visual reference for resource dashboards. Configure shared presentation here rather than copying styles into each feature:

| Concern | Shared source |
| --- | --- |
| Breadcrumb, one title, description underneath, right-side actions | `../layout/dashboard-header.tsx` |
| Stat card: label, prominent value, supporting note | `dashboard.tsx` → `DashboardStatCard` |
| Table frame and section spacing | `table-layout.tsx` |
| Selected/inactive archive tabs and keyboard navigation | `tabs.tsx` → `variant="resource"` |
| Header, row, checkbox, and cell styling | `table.tsx` |
| Record range and previous/next controls | `record-pagination.tsx` |
| Creation-date column order and date formatting | `../../lib/resource-table.ts` |
| Resource-specific columns, supported actions, and form fields | `src/features/<module>/*config.ts` |

Use this order on each resource screen:

1. `DashboardHeader`: breadcrumb, a single title with no adjacent badges or descriptive text, description below, then the action area. The primary action is Add/Create with a plus icon when supported; preserve permission checks.
2. A responsive grid of `DashboardStatCard` components, including matching loading cards.
3. `TablePanel` with the sections below, in order.

The table has four sections when archive tabs apply, and three otherwise:

1. **Optional tabs:** `TableTabSection` containing `Tabs` and `TabsList variant="resource"`. Only render for resources that actually support soft deletion/archiving. Use All and Deleted/Archived, preserving existing resource-specific states. Changing tabs resets the page and selected rows.
2. **Toolbar:** `TableToolbar`, with search on the left and bulk actions, filters, sorting and row count selectors on the right. Bulk actions appear when rows are selected and use the same permissions/endpoints as row actions.
3. **Contents:** selection checkbox when a bulk operation is supported, `#`, useful data columns, Created at, and Actions. Use the shared dropdown styling for View details, Update details, and Delete/Archive; use Restore for archived records. Do not add nonfunctional mutation controls to read-only reports or audit logs.
4. **Footer:** `RecordPagination` displays `Showing from–to of total` and page navigation, including the zero-record state. Keep navigation disabled during requests.

Commerce dashboards use `features/commerce/use-commerce-records.ts` for server-side search, status filters, sorting and pagination. Configure their titles, descriptions, statuses and statistics in `commerce-config.ts`, columns and CSV fields in `commerce-columns.tsx`, and grouped detail views in `commerce-details-dialog.tsx`. Their read-only administrative API supports viewing and exporting records; archive tabs and mutation controls are omitted.

Dairy read-only registries use `use-record-page.ts` for API pagination. Their search is explicitly scoped to the loaded page because their backend endpoints do not all support global search.

## Feedback and safety

- `toast.ts` is the single notification manager. Use `toast.success`, `toast.error`, `toast.warning`, `toast.info`, or `toast.loading`.
- `confirmation-alert-dialog.tsx` handles normal confirmations.
- `typed-confirmation-alert-dialog.tsx` requires a confirmation phrase for destructive operations.

## Forms

- Build fields from `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `Input`, and `Textarea`.
- `FieldGrid` provides the standard responsive two-column form layout. Pair short fields (phone, dates, numbers, status and compact selectors); keep names of organisations, long relationship selectors, notes and complex inputs full width with `sm:col-span-2`. Mobile remains one column.
- Use named `FormDialog` steps for long create and edit forms, grouped by task (identity, operator/contact, location, licence). Keep values in parent state: inactive steps unmount, so `defaultValue` and final-step `FormData` alone will lose earlier input. Validate each step before advancing and validate the complete payload before saving.
- `Stepper` provides multi-stage form progress and optional step navigation.
- `FormDialog` owns submission state, cancel/save actions, and consistent spacing.
- Its header and action footer remain visible; only `DialogBody` scrolls. Keep field content inside the body, and do not add another viewport-height scroll container.
- `CustomViewDetailsDialog` uses the same shell for read-only views. Group related fields with `DetailSection`, and render label/value pairs with `DetailItem`. Use `className="sm:col-span-2"` for long descriptions. Detail grids collapse to one column on mobile.

Form dialog sizes:

| Size | Intended use |
| --- | --- |
| `sm` | One or two compact fields |
| `md` | Standard confirmation or short form |
| `lg` | Default CRUD create/edit form |
| `xl` | Complex multi-section or stepped form |
| `full` | Large previews and dense configuration workspaces |

## Tables

- `table.tsx` contains semantic table primitives.
- `DataTable` is the standard generic record table with typed columns, empty state, and optional footer.
- For custom resource tables, compose `TablePanel`, optional `TableTabSection`, `TableToolbar`, `Table`, and `RecordPagination`. `TablePagination` is the low-level footer for specialized content. Avoid nesting a second bordered card or horizontal scroll container around `Table`.
- Shared primitives own header typography, row height, cell padding, selection, hover, and keyboard-accessible horizontal scrolling. Use column classes only for alignment, width, or wrapping; right-align numeric amounts and row actions, and use `tabular-nums` for quantities.
- Keep the same columns in loading and populated states. Preserve each resource's existing search, selection, and pagination handlers when changing presentation.

## Dashboard

- `DashboardPage` owns the maximum width and vertical rhythm.
- `DashboardStatsGrid` provides the responsive KPI grid.
- `DashboardStatCard` is the shared metric card.
- `DashboardSection` is the standard titled dashboard panel.

## Sessions

Session state is managed by `AuthSessionProvider`. Use `useAuthSession()` for the current user, status, refresh, profile update, and sign-out actions. Laravel tokens remain in HTTP-only cookies and are never exposed to browser JavaScript.
