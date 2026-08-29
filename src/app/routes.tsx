import { DESIGN_SYSTEMS } from "../design-systems";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/AdminLayout";
import { DraftPage } from "./pages/DraftPage";
import { AdminPage } from "./pages/AdminPage";
import { LoginPage } from "./pages/LoginPage";
import { RequireRole } from "./components/RequireRole";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      {
        index: true,
        element: (
          <RequireRole allow={["admin"]}>
            <AdminPage />
          </RequireRole>
        ),
      },
    ],
  },
  {
    path: "/",
    Component: Layout,
    children: [
      ...DESIGN_SYSTEMS.flatMap(ds => ds.routes),
      { path: "drafts/:id", Component: DraftPage },
    ],
  },
]);
