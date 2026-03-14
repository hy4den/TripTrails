import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ExplorePage from './pages/Explore/ExplorePage';
import RouteCreatePage from './pages/RouteCreate/RouteCreatePage';
import RouteViewPage from './pages/RouteView/RouteViewPage';
import RouteTrackPage from './pages/RouteTrack/RouteTrackPage';
import ProfilePage from './pages/Profile/ProfilePage';
import FriendsPage from './pages/Friends/FriendsPage';
import MessagesPage from './pages/Messages/MessagesPage';
import SeedPage from './pages/Seed/SeedPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';

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
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/seed" element={<SeedPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
