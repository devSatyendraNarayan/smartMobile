import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Loading from "./components/Loading";
import useOnlineStatus from "./context/OnlineStatus";
import NointernetConnection from "./pages/NointernetConnection";
import { SaveProvider } from "./context/SaveContext";
import { ThemeProvider } from "./context/ThemeContext";
import { TransferProvider } from "./context/TransferContext";
import { IfscProvider } from "./context/IfscContext";
import Header from "./components/Header";
import BottomNavigation from "./components/BottomNavigation";

// Lazy load pages
const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const TransferMoneyPage = lazy(() => import("./pages/TransferMoneyPage"));
const IfscDetails = lazy(() => import("./components/IfscDetails"));
const CustomerDetails = lazy(() => import("./pages/CustomerDetails"));
const Transaction = lazy(() => import("./pages/Transaction"));
const DetailView = lazy(() => import("./pages/DetailView"));

// Define route configurations
const routeConfig = [
  { path: "/home", element: <Home /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "/transfer-money", element: <TransferMoneyPage /> },
  { path: "/Bank-details", element: <IfscDetails /> },
  { path: "/customers-details", element: <CustomerDetails /> },
  { path: "/transaction", element: <Transaction /> },
];

const App = () => {
  const isOnline = useOnlineStatus();

  return (
    <AuthProvider>
      <ThemeProvider>
        <SaveProvider>
          <TransferProvider>
            <IfscProvider>
              <Router>
                <ErrorBoundary>
                  {!isOnline && <NointernetConnection />}
                  <Routes>
                    <Route element={<Layout />}>
                      <Route path="/login" element={<Login />} />
                      <Route element={<ProtectedRoute />}>
                        <Route
                          path="/details/:collectionName/:docId"
                          element={<DetailView />}
                        />
                        {routeConfig.map(({ path, element }) => (
                          <Route
                            key={path}
                            path={path}
                            element={
                              <Suspense fallback={<Loading />}>
                                {element}
                              </Suspense>
                            }
                          />
                        ))}
                        <Route
                          path="/"
                          element={<Navigate to="/home" replace />}
                        />
                      </Route>
                      <Route
                        path="*"
                        element={<Navigate to="/home" replace />}
                      />
                    </Route>
                  </Routes>
                </ErrorBoundary>
              </Router>
            </IfscProvider>
          </TransferProvider>
        </SaveProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const showHeaderFooter = user && location.pathname !== "/login";

  return (
    <div className="flex flex-col min-h-screen">
      {showHeaderFooter && <Header />}
      <main className="flex-grow py-20">
        <Outlet />
      </main>
      {showHeaderFooter && <BottomNavigation />}
    </div>
  );
};

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default App;