import { Navigate, Outlet } from 'react-router-dom';
import { useIsLoggedIn } from '@app/hooks/useIsLoggedIn';

const PrivateRoute = () => {
  const isLoggedIn = useIsLoggedIn();

  console.log('PrivateRoute - isLoggedIn:', isLoggedIn);

  return isLoggedIn ? <Outlet /> : <Navigate to={`/login`} />;
};

export default PrivateRoute;
