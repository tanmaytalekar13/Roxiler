# RateStore Frontend

## Overview

The RateStore frontend is a Vite React single-page application for store ratings. It provides public authentication screens and role-specific dashboards for administrators, users, and store owners.

## Features

- Login and signup forms.
- Session rehydration through refresh token cookies.
- Role-based route protection and redirects.
- Admin dashboard totals.
- Admin user listing, user creation, user detail view, store listing, and store creation.
- User store browsing with search, sorting, pagination, and star rating submission/update.
- Owner dashboard with store summary, average rating, total ratings, and sortable customer ratings table.
- Change-password screens for users and owners.
- Reusable UI components for forms, tables, pagination, badges, modals, loading states, and ratings.
- Responsive dashboard layout with desktop sidebar and mobile drawer.

## Tech Stack

Runtime dependencies:

- `@hookform/resolvers` `^5.4.0`
- `@tailwindcss/vite` `^4.3.1`
- `axios` `^1.18.1`
- `react` `^19.2.7`
- `react-dom` `^19.2.7`
- `react-hook-form` `^7.80.0`
- `react-hot-toast` `^2.6.0`
- `react-icons` `^5.6.0`
- `react-router-dom` `^7.18.0`
- `tailwindcss` `^4.3.1`
- `zod` `^4.4.3`

Development dependencies:

- `@eslint/js` `^10.0.1`
- `@types/react` `^19.2.17`
- `@types/react-dom` `^19.2.3`
- `@vitejs/plugin-react` `^6.0.2`
- `eslint` `^10.5.0`
- `eslint-plugin-react-hooks` `^7.1.1`
- `eslint-plugin-react-refresh` `^0.5.3`
- `globals` `^17.6.0`
- `vite` `^8.1.0`

## Folder Structure

```text
Frontend/
|-- public/
|-- src/
|   |-- assets/
|   |-- components/
|   |-- constants/
|   |-- context/
|   |-- hooks/
|   |-- layouts/
|   |-- pages/
|   |   |-- admin/
|   |   |-- auth/
|   |   |-- owner/
|   |   `-- user/
|   |-- routes/
|   |-- services/
|   |-- utils/
|   |-- App.jsx
|   |-- index.css
|   `-- main.jsx
|-- index.html
|-- package.json
`-- vite.config.js
```

- `public/`: Static icons and favicon.
- `src/assets/`: Image and SVG assets.
- `src/components/`: Reusable UI components such as buttons, inputs, tables, pagination, badges, spinners, and star ratings.
- `src/context/`: `AuthContext` for authenticated user and loading state.
- `src/hooks/`: `useAuth` convenience hook.
- `src/layouts/`: Auth and dashboard layout shells.
- `src/pages/`: Route-level screens grouped by role/domain.
- `src/routes/`: Main route configuration and route helper files.
- `src/services/api.js`: Axios instance, token memory store, interceptors, and API functions.
- `src/utils/`: Formatting helpers.

## Application Flow

`main.jsx` renders `App` inside `BrowserRouter`. `App.jsx` wraps the route tree with `AuthProvider`. `AuthProvider` attempts to refresh the session on page load, stores the returned access token in memory, then calls `/auth/me` to load the current user.

`AppRoutes.jsx` defines the active route tree:

- `/`: Redirects authenticated users by role and unauthenticated users to `/login`.
- `/login`: Login page.
- `/signup`: Signup page.
- `/admin`: Admin dashboard.
- `/admin/users`: Admin user list.
- `/admin/users/new`: Admin create user.
- `/admin/users/:id`: Admin user detail.
- `/admin/stores`: Admin store list.
- `/admin/stores/new`: Admin create store.
- `/stores`: User store browsing and rating page.
- `/change-password`: User password change page.
- `/owner`: Owner dashboard.
- `/owner/change-password`: Owner password change page.
- `*`: Not found page.

Navigation is provided by `DashboardLayout`, which chooses sidebar links based on `user.role`.

## Pages

- `Login`: Authenticates with email/password, stores the access token in memory, updates auth state, and redirects by role.
- `Signup`: Registers a standard user and redirects to login after success.
- `AdminDashboard`: Shows total users, stores, and ratings.
- `AdminUsers`: Lists users with search, role filtering, sorting, and pagination.
- `AddUser`: Admin form for creating users with `ADMIN`, `USER`, or `OWNER` role.
- `AdminUserDetail`: Shows a user's details; owner users can include their store summary.
- `AdminStores`: Lists stores with search, sorting, pagination, and aggregate ratings.
- `AddStore`: Creates a store and assigns it to an existing owner user.
- `UserStores`: Lists stores for users, shows overall rating, and allows submitting or updating one rating per store.
- `ChangePassword`: Lets a standard user change their password.
- `OwnerDashboard`: Shows the owner store profile, rating totals, average rating, and sortable customer ratings.
- `OwnerChangePassword`: Lets an owner change their password.
- `NotFound`: Handles unknown routes.
- `Unauthorized`: Exists in the codebase for unauthorized messaging, but the active route tree redirects wrong-role users instead.

## Components

Reusable components include:

- `Alert`: Status/error message display.
- `Badge`: Small status labels.
- `Button`: Shared button with loading support.
- `DataTable`: Table UI component.
- `EmptyState`: Empty-list display.
- `Input`: Shared form input.
- `Modal`: Dialog component.
- `PageHeader`: Page heading/action region.
- `Pagination`: Page navigation.
- `SearchBar`: Search input.
- `Select`: Shared select input.
- `Sidebar` and `Topbar`: Layout navigation components.
- `SortHeader`: Sortable table header.
- `Spinner`: Loading indicator.
- `StarRating`: Interactive/read-only rating control.
- `StatCard`: Metric card.

## State Management

The app uses local React state and context:

- `AuthContext` stores `user`, `setUser`, and `loading`.
- Access tokens are kept in module memory inside `services/api.js`.
- Pages use local `useState`, `useEffect`, and `useCallback` for filters, loading states, errors, pagination, and fetched data.
- Forms use `react-hook-form`.

There is no Redux, Zustand, or server-state caching library in the current implementation.

## API Layer

The Axios instance is configured in `src/services/api.js`:

```js
baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api"
withCredentials: true
```

Request handling:

- JSON requests use `Content-Type: application/json`.
- If an in-memory access token exists, the request interceptor adds `Authorization: Bearer <token>`.
- A debug request interceptor logs accidental primitive request bodies for `POST`, `PUT`, and `PATCH`.

Response handling:

- On `401` from non-auth routes, the client calls `POST /auth/refresh`.
- Concurrent requests wait for the same refresh operation.
- After refresh, the original failed request is retried with the new token.
- If refresh fails, the access token is cleared and the browser is redirected to `/login`.

Implemented frontend API calls that match backend routes:

- `signup`
- `login`
- `logout`
- `refreshToken`
- `getMe`
- `changePassword`
- `adminCreateUser`
- `adminGetUsers`
- `adminGetUser`
- `getAdminDashboard`
- `adminGetStores`
- `adminCreateStore`
- `getStores`
- `submitRating`
- `updateRating`
- `getOwnerDashboard`

The API file also exports helper functions for update/delete/get-single operations that do not currently have matching backend routes.

## Authentication Flow

1. On initial page load, `AuthProvider` calls `refreshToken()`.
2. If refresh succeeds, the returned access token is stored in memory with `setAccessToken`.
3. `AuthProvider` calls `getMe()` and stores the current user.
4. Route guards in `AppRoutes.jsx` wait for loading to finish.
5. Unauthenticated users are redirected to `/login`.
6. Authenticated users are redirected away from auth pages to their role home.
7. Wrong-role users are redirected to their own dashboard/home route.
8. Logout calls `/auth/logout`, clears the in-memory token and auth state, then navigates to `/login`.

## Styling

Styling uses Tailwind CSS 4 through the Vite plugin:

- `vite.config.js` registers `tailwindcss()` and `react()`.
- `src/index.css` imports Tailwind with `@import "tailwindcss";`.
- Components use Tailwind utility classes directly.
- `src/App.css` contains starter/demo styles but is not imported by the active app entry shown in `main.jsx`/`App.jsx`.

## Responsive Design

The dashboard layout uses responsive Tailwind classes:

- Desktop navigation uses a persistent sidebar from `md` and up.
- Mobile navigation uses a slide-out drawer and topbar.
- Pages use responsive grids such as `grid-cols-1`, `sm:grid-cols-2`, `sm:grid-cols-3`, and `lg:grid-cols-3`.
- Tables are wrapped with horizontal overflow where needed.

## Frontend Setup

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Environment Variables

Create `Frontend/.env` when the backend URL differs from the default:

```env
VITE_API_URL="http://localhost:8000/api"
```

- `VITE_API_URL`: Axios API base URL. Defaults to `http://localhost:8000/api`.

## Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the production bundle.
- `npm run lint`: Runs ESLint.
- `npm run preview`: Serves the production build locally.

## Best Practices Used

- Role-based route protection.
- Centralized API client.
- Access token kept in memory instead of localStorage.
- Refresh-token based session rehydration.
- Axios interceptor for automatic token refresh.
- Reusable UI components.
- Form handling with `react-hook-form`.
- Client-side validation rules aligned with backend constraints for signup.
- Responsive layouts with Tailwind utility classes.
