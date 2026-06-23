# Graph Report - .  (2026-06-22)

## Corpus Check
- Corpus is ~42,149 words - fits in a single context window. You may not need a graph.

## Summary
- 413 nodes · 672 edges · 32 communities (27 shown, 5 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dashboard React Components|Dashboard React Components]]
- [[_COMMUNITY_Admin Panel & API Client|Admin Panel & API Client]]
- [[_COMMUNITY_Backend Data Models|Backend Data Models]]
- [[_COMMUNITY_Audit Report & API Docs|Audit Report & API Docs]]
- [[_COMMUNITY_Wahoo API Client Service|Wahoo API Client Service]]
- [[_COMMUNITY_Error Boundary|Error Boundary]]
- [[_COMMUNITY_Frontend Package Config|Frontend Package Config]]
- [[_COMMUNITY_Webhook & App Config|Webhook & App Config]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Spike Docs & ADO Templates|Spike Docs & ADO Templates]]
- [[_COMMUNITY_Error Pages|Error Pages]]
- [[_COMMUNITY_Webhook Event Cache|Webhook Event Cache]]
- [[_COMMUNITY_FastAPI Main App|FastAPI Main App]]
- [[_COMMUNITY_Standalone HTML Dashboard|Standalone HTML Dashboard]]
- [[_COMMUNITY_Rate Limit Store|Rate Limit Store]]
- [[_COMMUNITY_Session Store|Session Store]]
- [[_COMMUNITY_Privacy Policy Page|Privacy Policy Page]]
- [[_COMMUNITY_Plans Router|Plans Router]]
- [[_COMMUNITY_Routes Router|Routes Router]]
- [[_COMMUNITY_Workouts Router|Workouts Router]]
- [[_COMMUNITY_Core Python Dependencies|Core Python Dependencies]]
- [[_COMMUNITY_Startup Script|Startup Script]]
- [[_COMMUNITY_Shutdown Script|Shutdown Script]]
- [[_COMMUNITY_FIT Upload Gap|FIT Upload Gap]]
- [[_COMMUNITY_HTTPX Dependency|HTTPX Dependency]]

## God Nodes (most connected - your core abstractions)
1. `get_settings()` - 30 edges
2. `_api_get()` - 18 edges
3. `compilerOptions` - 17 edges
4. `_get_sample()` - 15 edges
5. `Settings` - 9 edges
6. `Wahoo Dashboard README` - 9 edges
7. `Wahoo Integration Audit Report` - 9 edges
8. `Wahoo_Metrics_Dashboard React Component` - 9 edges
9. `_get_session_or_demo()` - 8 edges
10. `ChartInfo()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Wahoo_Metrics_Dashboard React Component` --semantically_similar_to--> `Wahoo Metrics Dashboard HTML (Chart.js)`  [INFERRED] [semantically similar]
  files/README.md → Wahoo_Metrics_Dashboard.html
- `10-Step Wahoo Integration Flow` --conceptually_related_to--> `Webhook HMAC-SHA256 Verification`  [INFERRED]
  files/Wahoo_Chest_Strap_Spike_PBI.md → README.md
- `me()` --calls--> `get_settings()`  [INFERRED]
  backend/routers/auth.py → backend/config.py
- `10-Step Wahoo Integration Flow` --conceptually_related_to--> `Wahoo OAuth 2.0 Authentication Flow`  [INFERRED]
  files/Wahoo_Chest_Strap_Spike_PBI.md → README.md
- `TD-5: Webhooks Log-Only, No Data Refresh` --conceptually_related_to--> `Webhook HMAC-SHA256 Verification`  [INFERRED]
  docs/wahoo/audit-report.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Dashboard Metrics Widgets (HR / HRV / Strain / Recovery / Activity)** — files_readme_hr_widget, files_readme_hrv_widget, files_readme_strain_widget, files_readme_recovery_widget, files_readme_activity_table [EXTRACTED 1.00]
- **Wahoo Integration Technical Debt Items (TD-1 through TD-7)** — audit_report_td1_narrow_oauth_scopes, audit_report_td2_token_refresh, audit_report_td3_workout_normalization, audit_report_td4_pagination, audit_report_td5_webhook_log_only, audit_report_td6_settings_cache, audit_report_td7_structured_errors [EXTRACTED 1.00]
- **Wahoo Spike Deliverable Package (PBI / Dashboard / ADO Template / Docs)** — files_spike_pbi_wahoo_spike_pbi, files_readme_wahoo_dashboard_component, files_ado_template_wahoo_ado_pbi, wahoo_chest_strap_wahoo_integration_documentation, files_quick_reference_quick_reference, files_summary_wahoo_deliverables_summary [EXTRACTED 1.00]

## Communities (32 total, 5 thin omitted)

### Community 0 - "Dashboard React Components"
Cohesion: 0.07
Nodes (44): ActivityTable(), INFO, Props, SortKey, TYPE_COLORS, HeartRateWidget(), INFO, Props (+36 more)

### Community 1 - "Admin Panel & API Client"
Cohesion: 0.07
Nodes (32): Props, RateLimitGauge(), Props, RateLimitHistory(), adminApi, AdminStats, authApi, AuthStatus (+24 more)

### Community 2 - "Backend Data Models"
Cohesion: 0.09
Nodes (36): Response, BaseModel, Activity, AdminStats, AuthStatus, HeartRateDailySummary, HeartRateZones, HistoricalMetrics (+28 more)

### Community 3 - "Audit Report & API Docs"
Cohesion: 0.09
Nodes (30): _api_get(), build_auth_url(), get_activities(), _normalize_activity(), Phase 2 Feature Roadmap, Plans API Endpoint (Missing), Power Zones API Endpoint (Missing), refresh_access_token() (+22 more)

### Community 4 - "Wahoo API Client Service"
Cohesion: 0.21
Nodes (24): get_settings(), Response, _api_get(), build_auth_url(), exchange_code(), get_activities(), get_heart_rate_history(), get_plan() (+16 more)

### Community 5 - "Error Boundary"
Cohesion: 0.09
Nodes (18): ErrorBoundary, Props, State, useAuth(), ConnectPage(), AdminPage, DashboardPage, Error429Page (+10 more)

### Community 6 - "Frontend Package Config"
Cohesion: 0.09
Nodes (22): dependencies, react, react-dom, react-router-dom, recharts, devDependencies, autoprefixer, postcss (+14 more)

### Community 7 - "Webhook & App Config"
Cohesion: 0.15
Nodes (18): Config, Settings, Request, Response, BaseSettings, _append_event(), clear_events(), _load_events() (+10 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 9 - "Spike Docs & ADO Templates"
Cohesion: 0.21
Nodes (17): Wahoo Spike ADO PBI Template, Wahoo Spike Quick Reference Card, Activity History Table (Sortable/Paginated), Heart Rate Widget, HRV Widget (RMSSD Trend), Recovery Score Widget, Daily Strain Widget (Gauge), Wahoo_Metrics_Dashboard React Component (+9 more)

### Community 10 - "Error Pages"
Cohesion: 0.13
Nodes (4): DEFAULT_META, ERROR_MAP, ErrorLayoutProps, ErrorMeta

### Community 11 - "Webhook Event Cache"
Cohesion: 0.27
Nodes (9): get_cached_workouts(), _load(), normalize_webhook_event(), Per-user workout cache populated by incoming webhook events. Normalized workouts, Insert or update a normalized workout for a user. Deduplicates by id., Return cached workouts for a user (newest first)., Map a Wahoo 'workout_summary' webhook event payload into the same     normalized, _save() (+1 more)

### Community 12 - "FastAPI Main App"
Cohesion: 0.22
Nodes (4): Request, wahoo_api_error_handler(), HTTPStatusError, JSONResponse

### Community 13 - "Standalone HTML Dashboard"
Cohesion: 0.25
Nodes (3): getHRZoneColor(), HeartRateWidget(), SAMPLE_DATA

### Community 14 - "Rate Limit Store"
Cohesion: 0.36
Nodes (8): count_requests_today(), get_current_status(), get_history(), _load(), JSON-file-backed rate limit tracker. rate_limits.json: { "entries": [ { timestam, Return the most recent rate limit snapshot (across all users or specific one)., record(), _save()

### Community 15 - "Session Store"
Cohesion: 0.44
Nodes (8): count_active_sessions(), create_session(), delete_session(), get_session(), _load(), File-backed session store. sessions.json: { session_id: { wahoo_user_id, access_, _save(), update_tokens()

### Community 17 - "Plans Router"
Cohesion: 0.83
Nodes (3): get_plan(), _get_session_or_demo(), list_plans()

### Community 18 - "Routes Router"
Cohesion: 0.83
Nodes (3): get_route(), _get_session_or_demo(), list_routes()

### Community 19 - "Workouts Router"
Cohesion: 0.83
Nodes (3): _get_session_or_demo(), workout_analytics(), workout_detail()

### Community 20 - "Core Python Dependencies"
Cohesion: 0.67
Nodes (3): FastAPI Backend, Pydantic v2, uvicorn ASGI Server

## Knowledge Gaps
- **94 isolated node(s):** `Config`, `Request`, `HTTPStatusError`, `JSONResponse`, `Response` (+89 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `get_settings()` connect `Wahoo API Client Service` to `Backend Data Models`, `Webhook & App Config`, `Plans Router`, `Routes Router`, `Workouts Router`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `Settings` connect `Webhook & App Config` to `Wahoo API Client Service`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `PageLoader()` connect `Error Boundary` to `Dashboard React Components`, `Admin Panel & API Client`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `get_settings()` (e.g. with `admin_stats()` and `auth_status()`) actually correct?**
  _`get_settings()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Config`, `Request`, `HTTPStatusError` to the rest of the system?**
  _106 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard React Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06604324956165984 - nodes in this community are weakly interconnected._
- **Should `Admin Panel & API Client` be split into smaller, more focused modules?**
  _Cohesion score 0.06745098039215686 - nodes in this community are weakly interconnected._