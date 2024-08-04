import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import ErrorBoundary from "./components/ErrorBoundary";
import Loading from "./components/Loading";
import useOnlineStatus from "./context/OnlineStatus";
import NointernetConnection from "./pages/NointernetConnection";
import { SaveProvider } from "./context/SaveContext";
import DetailView from "./pages/DetailView"; // Ensure this import

const Dashboard = lazy(() => import("./pages/Dashboard"));

// Add more routes here as your application grows
const routeConfig = [
  { path: "/dashboard", element: <Dashboard /> },
  // Example: { path: "/profile", element: <Profile /> },
  // Example: { path: "/settings", element: <Settings /> },
];

const App = () => {
  const isOnline = useOnlineStatus();
  return (
    <AuthProvider>
      <SaveProvider>
        <Router>
          <ErrorBoundary>
            {!isOnline && <NointernetConnection />}
            <Routes>
              <Route element={<Layout />}>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                <Route path="/details/:collectionName/:docId" element={<DetailView />} />                  {routeConfig.map(({ path, element }) => (
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
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </Router>
      </SaveProvider>
    </AuthProvider>
  );
};

const Layout = () => (
  <div className="flex flex-col min-h-screen">
    <main className="flex-grow">
      <Outlet />
    </main>
  </div>
);

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
