import { useAppSelector } from '@app/store/store';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const auth = useAppSelector((state) => state.auth);
  // Chỉ kiểm tra currentUser, không kiểm tra accessToken
  const isLoggedIn = !!auth.currentUser;
  
  console.log('PublicRoute - auth state:', auth);
  console.log('PublicRoute - isLoggedIn:', isLoggedIn);
  
  return isLoggedIn ? <Navigate to={`/`} /> : <Outlet />;
};

export default PublicRoute;
