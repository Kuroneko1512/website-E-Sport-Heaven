import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StyledBigUserImage, StyledSmallUserImage } from '@app/styles/common';
import {
  UserBody,
  UserFooter,
  UserHeader,
  UserMenuDropdown,
} from '@app/styles/dropdown-menus';
import {} from '@app/index';
import { useAppSelector } from '@app/store/store';
import { DateTime } from 'luxon';
import { AuthService } from '@app/services/auth.service';
import { useAuth } from '@app/hooks/useAuth';

const UserDropdown = () => {
  const navigate = useNavigate();
  const [t] = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const createdAt = useAppSelector((state) => state.auth.createdAt); // Lấy createdAt từ state
  const roles = useAppSelector((state) => state.auth.roles); // Lấy roles từ state
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const logOut = async (event: any) => {
    await logout();
    event.preventDefault();
    setDropdownOpen(false);
    navigate('/login');
  };

  const navigateToProfile = (event: any) => {
    event.preventDefault();
    setDropdownOpen(false);
    navigate('/profile');
  };

  // Lấy role đầu tiên để hiển thị (nếu có)
  const role = roles && roles.length > 0 ? roles[0] : '';

  return (
    <UserMenuDropdown isOpen={dropdownOpen} hideArrow>
      <StyledSmallUserImage
        slot="head"
        src={currentUser?.avatar || '/img/default-profile.png'}
        fallbackSrc="/img/default-profile.png"
        alt="User"
        width={25}
        height={25}
        rounded
      />
      <div slot="body">
        <UserHeader className=" bg-primary" style={{ 
            minHeight: '200px',
          }}>
          <StyledBigUserImage
            src={currentUser?.avatar || '/img/default-profile.png'}
            fallbackSrc="/img/default-profile.png"
            alt="User"
            width={90}
            height={90}
            rounded
          />
          <div className="user-info" style={{ 
              // Cố định chiều cao tối thiểu
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <p className="user-name" style={{ margin: 0, fontWeight: 'bold' }}>
              {currentUser?.name}
            </p>
            <small className="user-details" style={{ display: 'block', lineHeight: '1.5' }}>
              <div style={{ marginBottom: '2px' }}>{role}</div>
              <div style={{ marginBottom: '2px' }}>{currentUser?.email}</div>
              {createdAt && (
                <div>Thành viên từ {DateTime.fromFormat(createdAt, 'yyyy-MM-dd HH:mm:ss').toFormat('dd LLL yyyy')}</div>
              )}
            </small>
          </div>
        </UserHeader>
        {/* <UserBody>
          <div className="row">
            <div className="col-4 text-center">
              <Link to="/">{t('header.user.followers')}</Link>
            </div>
            <div className="col-4 text-center">
              <Link to="/">{t('header.user.sales')}</Link>
            </div>
            <div className="col-4 text-center">
              <Link to="/">{t('header.user.friends')}</Link>
            </div>
          </div>
        </UserBody> */}
        <UserFooter>
          <button
            type="button"
            className="btn btn-default btn-flat"
            onClick={navigateToProfile}
          >
            Hồ sơ
          </button>
          <button
            type="button"
            className="btn btn-default btn-flat float-right"
            onClick={logOut}
          >
            Đăng xuất
          </button>
        </UserFooter>
      </div>
    </UserMenuDropdown>
  );
};

export default UserDropdown;
