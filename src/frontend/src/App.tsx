import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";
import AutomationQueue from "./pages/AutomationQueue";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import SocialAccounts from "./pages/SocialAccounts";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  ),
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: Dashboard,
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editor/$id",
  component: Editor,
});

const socialRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/social",
  component: SocialAccounts,
});

const automationRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/automation",
  component: AutomationQueue,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([indexRoute, socialRoute, automationRoute]),
  editorRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
