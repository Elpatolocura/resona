import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import Player from '../components/Player';
import Toaster from '../components/Toaster';
import SearchBar from '../components/SearchBar';

export default function MainLayout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-line bg-bg/80 px-4 py-3 backdrop-blur lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SearchBar
              defaultValue={params.get('q') ?? ''}
              onSearch={handleSearch}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-52 lg:pb-36">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <Player />
      <MobileNav />
      <Toaster />
    </div>
  );
}
