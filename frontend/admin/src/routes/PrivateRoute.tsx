import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@app/store/store';

const PrivateRoute = () => {
  const auth = useAppSelector((state) => state.auth);
  // Chỉ kiểm tra currentUser, không kiểm tra accessToken
  const isLoggedIn = !!auth.currentUser;
  
  console.log('PrivateRoute - auth state:', auth);
  console.log('PrivateRoute - isLoggedIn:', isLoggedIn);
  
  return isLoggedIn ? <Outlet /> : <Navigate to={`/login`} />;
};

export default PrivateRoute;
