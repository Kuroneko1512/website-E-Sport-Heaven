import { Link } from 'react-router-dom';
import { MenuItem } from '@components';
import { Image } from '@profabric/react-components';
import styled from 'styled-components';
import { SidebarSearch } from '@app/components/sidebar-search/SidebarSearch';
import i18n from '@app/utils/i18n';
import { useAppSelector } from '@app/store/store';

export interface IMenuItem {
  name: string;
  icon?: string;
  path?: string;
  children?: Array<IMenuItem>;
}

export const MENU: IMenuItem[] = [
  {
    name: 'Bảng điều khiển',
    icon: 'fas fa-tachometer-alt nav-icon', // Bảng điều khiển -> biểu tượng dashboard
    path: '/',
  },
  {
    name: i18n.t('menusidebar.label.blank'),
    icon: 'fas fa-wrench nav-icon', // Tạm giữ nguyên vì không rõ nội dung cụ thể
    path: '/blank',
  },
  {
    name: 'Sản phẩm',
    icon: 'fas fa-box-open nav-icon', // Sản phẩm -> hộp mở, phù hợp cho product
    path: '/Product',
  },
  {
    name: 'Danh mục',
    icon: 'fas fa-th-list nav-icon', // Danh mục -> danh sách lưới
    path: '/Category',
  },
  {
    name: 'Thuộc tính',
    icon: 'fas fa-tags nav-icon', // Thuộc tính -> thẻ/tag là biểu tượng hợp lý
    path: '/Attribute',
  },
  {
    name: 'Đơn hàng',
    icon: 'fas fa-shopping-cart nav-icon', // Đơn hàng -> giỏ hàng
    path: '/Order',
  },
  {
    name: 'Mã giảm giá',
    icon: 'fas fa-tags nav-icon', // Mã giảm giá -> thẻ/tag là biểu tượng hợp lý
    path: '/Coupon',
  },
  {
    name: "Bài viết",
    icon: "fas fa-newspaper nav-icon",
    children: [
      {
        name: "Tất cả bài viết",
        icon: "fas fa-newspaper nav-icon",
        path: "/blog",
      },
      {
        name: "Danh mục bài viết",
        icon: "fas fa-th-list nav-icon",
        path: "/blog-category",
      },
    ],
  },  
  {
    name: i18n.t('menusidebar.label.mainMenu'),
    icon: 'far fa-caret-square-down nav-icon',
    children: [
      {
        name: i18n.t('menusidebar.label.subMenu'),
        icon: 'fas fa-hammer nav-icon',
        path: '/sub-menu-1',
      },

      {
        name: i18n.t('menusidebar.label.blank'),
        icon: 'fas fa-cogs nav-icon',
        path: '/sub-menu-2',
      },
    ],
  },
];

const StyledBrandImage = styled(Image)`
  float: left;
  line-height: 0.8;
  margin: -1px 8px 0 6px;
  opacity: 0.8;
  --pf-box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19),
    0 6px 6px rgba(0, 0, 0, 0.23) !important;
`;

const StyledUserImage = styled(Image)`
  --pf-box-shadow: 0 3px 6px #00000029, 0 3px 6px #0000003b !important;
`;

const MenuSidebar = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const sidebarSkin = useAppSelector((state) => state.ui.sidebarSkin);
  const menuItemFlat = useAppSelector((state) => state.ui.menuItemFlat);
  const menuChildIndent = useAppSelector((state) => state.ui.menuChildIndent);

  return (
    <aside className={`main-sidebar elevation-4 ${sidebarSkin}`}>
      <Link to="/" className="brand-link">
        <StyledBrandImage
          src="img/logo.png"
          alt="AdminLTE Logo"
          width={33}
          height={33}
          rounded
        />
        <span className="brand-text font-weight-light">Quản trị viên</span>
      </Link>
      <div className="sidebar">
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <StyledUserImage
              src={currentUser?.photoURL}
              fallbackSrc="/img/default-profile.png"
              alt="User"
              width={34}
              height={34}
              rounded
            />
          </div>
          <div className="info">
            <Link to={'/profile'} className="d-block">
              {currentUser?.email}
            </Link>
           
          </div>
        </div>

        <div className="form-inline">
          <SidebarSearch />
        </div>

        <nav className="mt-2" style={{ overflowY: 'hidden' }}>
          <ul
            className={`nav nav-pills nav-sidebar flex-column${
              menuItemFlat ? ' nav-flat' : ''
            }${menuChildIndent ? ' nav-child-indent' : ''}`}
            role="menu"
          >
            {MENU.map((menuItem: IMenuItem) => (
              <MenuItem
                key={menuItem.name + menuItem.path}
                menuItem={menuItem}
              />
            ))}
            
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default MenuSidebar;
