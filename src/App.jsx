import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

const HomePage = lazy(() => import('./pages/Home/HomePage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const ExplorePage = lazy(() => import('./pages/Explore/ExplorePage'));
const RouteCreatePage = lazy(() => import('./pages/RouteCreate/RouteCreatePage'));
const RouteViewPage = lazy(() => import('./pages/RouteView/RouteViewPage'));
const RouteTrackPage = lazy(() => import('./pages/RouteTrack/RouteTrackPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const FriendsPage = lazy(() => import('./pages/Friends/FriendsPage'));
const PeoplePage = lazy(() => import('./pages/People/PeoplePage'));
const MessagesPage = lazy(() => import('./pages/Messages/MessagesPage'));
const WorldProgressPage = lazy(() => import('./pages/WorldProgress/WorldProgressPage'));
const SeedPage = lazy(() => import('./pages/Seed/SeedPage'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/routes/:routeId" element={<RouteViewPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/routes/create" element={<RouteCreatePage />} />
          <Route path="/routes/:routeId/track" element={<RouteTrackPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/world" element={<WorldProgressPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/seed" element={<SeedPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
