import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import Player from '../components/Player';
import Toaster from '../components/Toaster';

export default function MainLayout() {
  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />

      <div className="flex h-full min-w-0 flex-1 flex-col">
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
