<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

1. ## Dashboard Design Rules
- Ensure that the dashboard is responsive and can be accessed from both desktop and mobile devices
- Ensure the Header, Breadcrumb, Table structure with Top Filters, Table Data and Footer below, Follow how Farmers Dashboard looks like.
- The Table Columns should all Start with CheckBox Column for Bulk Delete for Data which needs Deletion, And Followed by # column for Indec-counting, and at the end ensure CreatedAt, Status if present, and Column with no Label for Actions.
- The Column-No-Label is for Actions only, it should be at the end of the table, with no label, just the actions three-dot-vert-icon DropdownMenu (View, Update, Delete) and other actions if needed.
- Ensure no RefreshButton at the HEader, learn from FarmerDashboard Header.
- Ensure to ReUse Already made Components for clean and efficient code, and Follow the Coding Standards.

2. ## Overview Page
- Ensure the overview page is responsive and can be accessed from both desktop and mobile devices.
- Also, Ensure that it have the Important StatCard with 3-sections top, middle, and Description below all with 1-line, Learn from Already made stat-card.
- Ensure the ServerHealthyCard is always at the Last Row end.

3. ## Analytics and Report Page
- Ensure the analytics and report page is responsive and can be accessed from both desktop and mobile devices.
- Ensure all Tables and Data are all on the Reports and Analytics Including Proper Charts and Graphs like a Proffesional Data Analutics to Design those Charts and Graphs.

4. ## Forms and Dialogs
- Ensure any Action has a Confirmation to be triggerd and Accepted.
- Forms Must be Responsive and Easy to Fill.
- Forms with many Fields should be Stepper (check how others implemented).
