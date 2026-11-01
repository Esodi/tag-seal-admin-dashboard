# Tag & Seal UI foundation

All reusable admin UI primitives live in this directory and are exported by `index.ts`.

## Feedback and safety

- `toast.ts` is the single notification manager. Use `toast.success`, `toast.error`, `toast.warning`, `toast.info`, or `toast.loading`.
- `confirmation-alert-dialog.tsx` handles normal confirmations.
- `typed-confirmation-alert-dialog.tsx` requires a confirmation phrase for destructive operations.

## Forms

- Build fields from `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `Input`, and `Textarea`.
- `FieldGrid` provides the standard responsive two-column form layout.
- `Stepper` provides multi-stage form progress and optional step navigation.
- `FormDialog` owns submission state, cancel/save actions, and consistent spacing.

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

## Dashboard

- `DashboardPage` owns the maximum width and vertical rhythm.
- `DashboardStatsGrid` provides the responsive KPI grid.
- `DashboardStatCard` is the shared metric card.
- `DashboardSection` is the standard titled dashboard panel.

## Sessions

Session state is managed by `AuthSessionProvider`. Use `useAuthSession()` for the current user, status, refresh, profile update, and sign-out actions. Laravel tokens remain in HTTP-only cookies and are never exposed to browser JavaScript.
