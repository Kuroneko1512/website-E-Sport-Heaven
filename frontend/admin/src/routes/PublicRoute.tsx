import { Navigate, Outlet } from 'react-router-dom';
import { useIsLoggedIn } from '@app/hooks/useIsLoggedIn';

const PublicRoute = () => {
  const isLoggedIn = useIsLoggedIn();

  console.log('PublicRoute - isLoggedIn:', isLoggedIn);

  return isLoggedIn ? <Navigate to={`/`} /> : <Outlet />;
};

export default PublicRoute;
