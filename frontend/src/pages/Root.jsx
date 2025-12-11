import { Outlet } from 'react-router-dom';
import Header from '@components/Header';
import ProtectedRoute from '@components/ProtectedRoute';

function Root() {
  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh' }}>
        <Header />
        <main style={{ paddingTop: '80px' }}>
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default Root;