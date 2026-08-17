import {useState} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Hub from './Hub';
import GameRoute from './GameRoute';
import LeaderboardPage from './LeaderboardPage';
import {GAMES} from './games';
import {loadProfile, type PolymindProfile} from '../profile/profileStore';

export default function AppShell() {
  const [profile, setProfile] = useState<PolymindProfile>(() => loadProfile());

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub profile={profile} onProfileChange={setProfile} />} />
        <Route path="/leaderboard" element={<LeaderboardPage profile={profile} />} />
        {GAMES.map((game) => (
          <Route key={game.id} path={game.path} element={<GameRoute game={game} profile={profile} />} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}
