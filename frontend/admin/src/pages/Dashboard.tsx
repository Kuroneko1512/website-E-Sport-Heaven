import React, { useState, useEffect } from 'react';
import { InfoBox } from '@app/components/info-box/InfoBox';
import { ContentHeader, SmallBox } from '@components';
import {
  faBookmark,
  faChartSimple,
  faCartShopping,
  faUserPlus,
  faChartPie,
  faDollarSign,
  faUsers,
  faShoppingCart,
  faFilter,
  faMoneyBill,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement, 
  LineElement,  
  ArcElement,   
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { getDashboardAnalytics, DashboardData } from '@app/services/Dashboard/DashboardApi';

// Đăng ký các thành phần Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [topProductsLimit, setTopProductsLimit] = useState<number>(5);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Hàm format ngày cho input date
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };


  // Hàm format tiền tệ VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
        currencyDisplay: 'code'
    }).format(amount);
  };

  // Hàm format số
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  // Hàm fetch dữ liệu dashboard từ API
  const fetchDashboardData = async (customFromDate?: string, customToDate?: string, customLimit?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {};
      if (customFromDate || fromDate) params.from_date = customFromDate || fromDate;
      if (customToDate || toDate) params.to_date = customToDate || toDate;
      if (customLimit || topProductsLimit) params.top_products_limit = customLimit || topProductsLimit;
      
      const result = await getDashboardAnalytics(params.from_date, params.to_date, params.top_products_limit);
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý apply filter
  const handleApplyFilter = () => {
    fetchDashboardData(fromDate, toDate, topProductsLimit);
  };

  // Hàm reset filter
  const handleResetFilter = () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    const newToDate = formatDateForInput(today);
    const newFromDate = formatDateForInput(weekAgo);
    const newLimit = 5;
    
    setToDate(newToDate);
    setFromDate(newFromDate);
    setTopProductsLimit(newLimit);
    
    fetchDashboardData(newFromDate, newToDate, newLimit);
  };

    // Khởi tạo ngày mặc định (7 ngày gần nhất)
  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 30);
    
    setToDate(formatDateForInput(today));
    setFromDate(formatDateForInput(weekAgo));
      if (today && weekAgo) {
      fetchDashboardData( formatDateForInput(weekAgo), formatDateForInput(today), 5);
    }
  }, []);

  
  // Hàm chia tên sản phẩm thành nhiều dòng
  const splitProductName = (name: string, maxLength: number = 12) => {
    if (name.length <= maxLength) return [name];
    
    const words = name.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word.substring(0, maxLength));
          currentLine = '';
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.slice(0, 2);
  };

  if (loading) {
    return (
      <div className="content">
        <ContentHeader title="Bảng điều khiển" />
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <ContentHeader title="Bảng điều khiển" />
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Lỗi!</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={() => fetchDashboardData()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="content">
        <ContentHeader title="Bảng điều khiển" />
        <div className="alert alert-warning" role="alert">
          Không có dữ liệu để hiển thị.
        </div>
      </div>
    );
  }

  // Chuẩn bị dữ liệu cho biểu đồ doanh thu theo thời gian
  const revenueChartData = {
    labels: dashboardData.revenue_chart.map(item => 
      new Date(item.period).toLocaleDateString('vi-VN', { 
        month: 'short', 
        day: 'numeric' 
      })
    ),
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: dashboardData.revenue_chart.map(item => item.revenue),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Chuẩn bị dữ liệu cho biểu đồ số đơn hàng
  const ordersChartData = {
    labels: dashboardData.revenue_chart.map(item => 
      new Date(item.period).toLocaleDateString('vi-VN', { 
        month: 'short', 
        day: 'numeric' 
      })
    ),
    datasets: [
      {
        label: 'Số đơn hàng',
        data: dashboardData.revenue_chart.map(item => item.orders),
        backgroundColor: 'rgba(99, 255, 128, 0.6)',
        borderColor: 'rgb(99, 255, 154)',
        borderWidth: 1,
      },
    ],
  };

  // Chuẩn bị dữ liệu cho biểu đồ trạng thái đơn hàng
  const orderStatusLabels = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    ready_to_ship: 'Sẵn sàng giao',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    return_requested: 'Yêu cầu trả',
    return_processing: 'Đang xử lý trả',
    return_completed: 'Đã trả',
    return_rejected: 'Từ chối trả'
  };

  const orderStatusData = {
    labels: Object.entries(dashboardData.order_status)
      .filter(([_, value]) => value > 0)
      .map(([key, _]) => orderStatusLabels[key as keyof typeof orderStatusLabels]),
    datasets: [
      {
        data: Object.entries(dashboardData.order_status)
          .filter(([_, value]) => value > 0)
          .map(([_, value]) => value),
        backgroundColor: [
          '#28a745', '#007bff', '#ffc107', '#17a2b8',
          '#6c757d', '#343a40', '#dc3545', '#fd7e14',
          '#20c997', '#6f42c1', '#e83e8c', '#6610f2'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chuẩn bị dữ liệu cho biểu đồ sản phẩm bán chạy
  const topProductsData = {
    labels: dashboardData.top_products.slice(0, topProductsLimit).map(product => {
      return splitProductName(product.product_name);
    }),
    datasets: [
      {
        label: 'Số lượng bán',
        data: dashboardData.top_products.slice(0, topProductsLimit).map(product => product.total_sold),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)',
          'rgba(255, 99, 255, 0.8)',
          'rgba(99, 255, 132, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(255, 99, 255, 1)',
          'rgba(99, 255, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (context.dataset.label === 'Doanh thu (VND)') {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
          },
          title: function(context: any) {
            const index = context[0].dataIndex;
            return dashboardData.top_products[index]?.product_name || context[0].label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          font: {
            size: 10
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatNumber(value);
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${formatNumber(context.parsed)}`;
          }
        }
      }
    }
  };

  return (
    <div>
      <ContentHeader title="Bảng điều khiển" />

      <section className="content">
        <div className="container-fluid">
          {/* Filter Section */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                    Bộ lọc dữ liệu
                  </h3>
                  <div className="card-tools">
                    <button 
                      type="button" 
                      className="btn btn-tool" 
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <i className={`fas ${showFilters ? 'fa-minus' : 'fa-plus'}`}></i>
                    </button>
                  </div>
                </div>
                {showFilters && (
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="fromDate">Từ ngày:</label>
                          <input
                            type="date"
                            id="fromDate"
                            className="form-control"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="toDate">Đến ngày:</label>
                          <input
                            type="date"
                            id="toDate"
                            className="form-control"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="topProductsLimit">Số sản phẩm top:</label>
                          <select
                            id="topProductsLimit"
                            className="form-control"
                            value={topProductsLimit}
                            onChange={(e) => setTopProductsLimit(Number(e.target.value))}
                          >
                            <option value={5}>Top 5</option>
                            <option value={10}>Top 10</option>
                            <option value={15}>Top 15</option>
                            <option value={20}>Top 20</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>&nbsp;</label>
                          <div className="d-flex">
                            <button
                              type="button"
                              className="btn btn-primary mr-2"
                              onClick={handleApplyFilter}
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <i className="fas fa-spinner fa-spin mr-1"></i>
                                  Đang tải...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-search mr-1"></i>
                                  Áp dụng
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={handleResetFilter}
                              disabled={loading}
                            >
                              <i className="fas fa-undo mr-1"></i>
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <div className="text-muted">
                          <i className="fas fa-info-circle mr-1"></i>
                          Dữ liệu hiển thị từ {fromDate ? new Date(fromDate).toLocaleDateString('vi-VN') : 'N/A'} 
                          {' '}đến {toDate ? new Date(toDate).toLocaleDateString('vi-VN') : 'N/A'}
                          {' '}| Hiển thị top {topProductsLimit} sản phẩm bán chạy
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thống kê tổng quan */}
          <div className="row">
            <div className="col-lg-3 col-6">
              <SmallBox
                title="Doanh thu kỳ hiện tại"
                text={formatCurrency(dashboardData.revenue_comparison.current_period.revenue)}
                navigateTo="#"
                variant="info"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faMoneyBill}
                      style={{ fontSize: '40px' }}
                    />
                  ),
                }}
              />
            </div>
            <div className="col-lg-3 col-6">
              <SmallBox
                title="Đơn hàng kỳ hiện tại"
                text={formatNumber(dashboardData.revenue_comparison.current_period.orders)}
                navigateTo="#"
                variant="success"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faCartShopping}
                      style={{ fontSize: '62px' }}
                    />
                  ),
                }}
              />
            </div>
            <div className="col-lg-3 col-6">
              <SmallBox
                title="Khách hàng mới"
                text={formatNumber(dashboardData.customer_stats.new_customers)}
                navigateTo="#"
                variant="warning"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faUserPlus}
                      style={{ fontSize: '62px' }}
                    />
                  ),
                }}
              />
            </div>
            <div className="col-lg-3 col-6">
              <SmallBox
                title="Giá trị đơn hàng TB"
                text={formatCurrency(dashboardData.revenue_comparison.current_period.avg_order_value)}
                navigateTo="#"
                variant="success"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faChartPie}
                      style={{ fontSize: '62px' }}
                    />
                  ),
                }}
              />
            </div>
          </div>

          {/* Thống kê chi tiết */}
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                title="Tỷ lệ tăng trưởng doanh thu"
                text={`${dashboardData.revenue_comparison.growth.revenue_growth}%`}
                icon={{
                  content: <FontAwesomeIcon icon={faChartSimple} />,
                  variant: dashboardData.revenue_comparison.growth.revenue_growth >= 0 ? 'success' : 'danger',
                }}
                variant={dashboardData.revenue_comparison.growth.revenue_growth >= 0 ? 'success' : 'danger'}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                title="Tỷ lệ tăng trưởng đơn hàng"
                text={`${dashboardData.revenue_comparison.growth.orders_growth}%`}
                icon={{
                  content: <FontAwesomeIcon icon={faShoppingCart} />,
                  variant: dashboardData.revenue_comparison.growth.orders_growth >= 0 ? 'success' : 'danger',
                }}
                variant={dashboardData.revenue_comparison.growth.orders_growth >= 0 ? 'success' : 'danger'}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                title="Khách hàng quay lại"
                text={formatNumber(dashboardData.customer_stats.returning_customers)}
                icon={{
                  content: <FontAwesomeIcon icon={faUsers} />,
                  variant: 'info',
                }}
                variant="info"
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                title="Tỷ lệ giữ chân khách hàng"
                text={`${dashboardData.customer_stats.customer_retention_rate}%`}
                icon={{
                  content: <FontAwesomeIcon icon={faBookmark} />,
                  variant: 'warning',
                }}
                variant="warning"
                progressBar={{
                  description: 'Tỷ lệ khách hàng quay lại mua hàng',
                  level: dashboardData.customer_stats.customer_retention_rate,
                  variant: 'success',
                }}
              />
            </div>
          </div>
          
          {/* Biểu đồ */}
          <div className="row">
            {/* Biểu đồ doanh thu theo thời gian */}
            <div className="col-lg-8">
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">Biểu đồ doanh thu theo thời gian</h3>
                  <div className="card-tools">
                    <button type="button" className="btn btn-tool" data-card-widget="collapse">
                      <i className="fas fa-minus"></i>
                    </button>
                    <button type="button" className="btn btn-tool" data-card-widget="remove">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ height: '400px' }}>
                    <Line data={revenueChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Biểu đồ trạng thái đơn hàng */}
            <div className="col-lg-4">
              <div className="card card-success">
                <div className="card-header">
                  <h3 className="card-title">Trạng thái đơn hàng</h3>
                  <div className="card-tools">
                    <button type="button" className="btn btn-tool" data-card-widget="collapse">
                      <i className="fas fa-minus"></i>
                    </button>
                    <button type="button" className="btn btn-tool" data-card-widget="remove">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ height: '400px' }}>
                    <Doughnut data={orderStatusData} options={pieChartOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>
      
          <div className="row">
            {/* Biểu đồ số đơn hàng */}
            <div className="col-lg-6">
              <div className="card card-warning">
                <div className="card-header">
                  <h3 className="card-title">
                    Số đơn hàng theo thời gian
                    <small className="ml-2 text-black">
                      ({fromDate ? new Date(fromDate).toLocaleDateString('vi-VN') : 'N/A'} - {toDate ? new Date(toDate).toLocaleDateString('vi-VN') : 'N/A'})
                    </small>
                  </h3>
                  <div className="card-tools">
                    <button type="button" className="btn btn-tool" data-card-widget="collapse">
                      <i className="fas fa-minus"></i>
                    </button>
                    <button type="button" className="btn btn-tool" data-card-widget="remove">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    <Bar data={ordersChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>

                  {/* Biểu đồ sản phẩm bán chạy */}
            <div className="col-lg-6">
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">
                    Top {topProductsLimit} sản phẩm bán chạy
                    <small className="ml-2 text-white">
                      ({fromDate ? new Date(fromDate).toLocaleDateString('vi-VN') : 'N/A'} - {toDate ? new Date(toDate).toLocaleDateString('vi-VN') : 'N/A'})
                    </small>
                  </h3>
                  <div className="card-tools">
                    <button type="button" className="btn btn-tool" data-card-widget="collapse">
                      <i className="fas fa-minus"></i>
                    </button>
                    <button type="button" className="btn btn-tool" data-card-widget="remove">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    <Bar data={topProductsData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bảng sản phẩm bán chạy chi tiết */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    Chi tiết top {topProductsLimit} sản phẩm bán chạy
                    <small className="ml-2 text-muted">
                      ({fromDate ? new Date(fromDate).toLocaleDateString('vi-VN') : 'N/A'} - {toDate ? new Date(toDate).toLocaleDateString('vi-VN') : 'N/A'})
                    </small>
                  </h3>
                </div>
                <div className="card-body table-responsive p-0">
                  <table className="table table-hover text-nowrap">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th style={{ width: '250px' }}>Tên sản phẩm</th>
                        <th style={{ width: '120px' }}>SKU</th>
                        <th style={{ width: '150px' }}>Danh mục</th>
                        <th>Số lượng bán</th>
                        <th>Doanh thu</th>
                        <th>Số đơn hàng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.top_products.slice(0, topProductsLimit).map((product, index) => (
                        <tr key={product.product_id}>
                          <td>
                            <span className="badge badge-secondary">{index + 1}</span>
                          </td>
                          <td>
                            <div 
                              style={{ 
                                maxWidth: '250px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={product.product_name}
                            >
                              {product.product_name.length > 35 
                                ? product.product_name.substring(0, 35) + '...' 
                                : product.product_name
                              }
                            </div>
                          </td>
                          <td>
                            <span 
                              className="badge badge-info"
                              style={{
                                maxWidth: '100px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'inline-block'
                              }}
                              title={product.product_sku}
                            >
                              {product.product_sku.length > 12 
                                ? product.product_sku.substring(0, 12) + '...' 
                                : product.product_sku
                              }
                            </span>
                          </td>
                          <td>
                            <div 
                              style={{ 
                                maxWidth: '150px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={product.category_name}
                            >
                              {product.category_name.length > 20 
                                ? product.category_name.substring(0, 20) + '...' 
                                : product.category_name
                              }
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-success">{formatNumber(product.total_sold)}</span>
                          </td>
                          <td className="text-success font-weight-bold">
                            {formatCurrency(product.total_revenue)}
                          </td>
                          <td>
                            <span className="badge badge-primary">{formatNumber(product.total_orders)}</span>
                          </td>
                        </tr>
                      ))}
                      {dashboardData.top_products.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-4">
                            <i className="fas fa-inbox fa-2x mb-2"></i>
                            <br />
                            Không có dữ liệu sản phẩm trong khoảng thời gian này
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {dashboardData.top_products.length > 0 && (
                  <div className="card-footer">
                    <small className="text-muted">
                      <i className="fas fa-info-circle mr-1"></i>
                      Hiển thị {Math.min(topProductsLimit, dashboardData.top_products.length)} trong tổng số {dashboardData.top_products.length} sản phẩm
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* So sánh kỳ hiện tại vs kỳ trước */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    So sánh hiệu suất
                    <small className="ml-2 text-muted">
                      So với cùng kỳ trước đó
                    </small>
                  </h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h5>
                        Kỳ hiện tại 
                        <small className="text-muted ml-2">
                          ({fromDate ? new Date(fromDate).toLocaleDateString('vi-VN') : 'N/A'} - {toDate ? new Date(toDate).toLocaleDateString('vi-VN') : 'N/A'})
                        </small>
                      </h5>
                      <ul className="list-group">
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fas fa-dollar-sign text-success mr-2"></i>
                            Doanh thu
                          </span>
                          <span className="badge badge-primary badge-pill">
                            {formatCurrency(dashboardData.revenue_comparison.current_period.revenue)}
                          </span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fas fa-shopping-cart text-info mr-2"></i>
                            Số đơn hàng
                          </span>
                          <span className="badge badge-primary badge-pill">
                            {formatNumber(dashboardData.revenue_comparison.current_period.orders)}
                          </span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fas fa-chart-line text-warning mr-2"></i>
                            Giá trị đơn hàng trung bình
                          </span>
                          <span className="badge badge-primary badge-pill">
                            {formatCurrency(dashboardData.revenue_comparison.current_period.avg_order_value)}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h5>
                        Kỳ trước
                        <small className="text-muted ml-2">
                          (Cùng khoảng thời gian kỳ trước)
                        </small>
                      </h5>
                      <ul className="list-group">
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fas fa-dollar-sign text-success mr-2"></i>
                            Doanh thu
                          </span>
                          <span className="badge badge-secondary badge-pill">
                            {formatCurrency(dashboardData.revenue_comparison.previous_period.revenue)}
                          </span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fas fa-shopping-cart text-info mr-2"></i>
                            Số đơn hàng
                          </span>
                          <span className="badge badge-secondary badge-pill">
                            {formatNumber(dashboardData.revenue_comparison.previous_period.orders)}
                          </span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fas fa-chart-line text-warning mr-2"></i>
                            Giá trị đơn hàng trung bình
                          </span>
                          <span className="badge badge-secondary badge-pill">
                            {formatCurrency(dashboardData.revenue_comparison.previous_period.avg_order_value)}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="row mt-4">
                    <div className="col-12">
                      <h5>
                        <i className="fas fa-chart-bar mr-2"></i>
                        Tỷ lệ tăng trưởng
                      </h5>
                      <div className="progress-group">
                        <span className="float-right">
                          <b className={dashboardData.revenue_comparison.growth.revenue_growth >= 0 ? 'text-success' : 'text-danger'}>
                            {dashboardData.revenue_comparison.growth.revenue_growth >= 0 ? '+' : ''}{dashboardData.revenue_comparison.growth.revenue_growth}%
                          </b>
                        </span>
                        <span>
                          <i className="fas fa-dollar-sign mr-1"></i>
                          Doanh thu
                        </span>
                        <div className="progress progress-sm">
                          <div 
                            className={`progress-bar ${dashboardData.revenue_comparison.growth.revenue_growth >= 0 ? 'bg-success' : 'bg-danger'}`}
                            style={{ 
                              width: `${Math.min(Math.abs(dashboardData.revenue_comparison.growth.revenue_growth), 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="progress-group">
                        <span className="float-right">
                          <b className={dashboardData.revenue_comparison.growth.orders_growth >= 0 ? 'text-success' : 'text-danger'}>
                            {dashboardData.revenue_comparison.growth.orders_growth >= 0 ? '+' : ''}{dashboardData.revenue_comparison.growth.orders_growth}%
                          </b>
                        </span>
                        <span>
                          <i className="fas fa-shopping-cart mr-1"></i>
                          Đơn hàng
                        </span>
                        <div className="progress progress-sm">
                          <div 
                            className={`progress-bar ${dashboardData.revenue_comparison.growth.orders_growth >= 0 ? 'bg-success' : 'bg-danger'}`}
                            style={{ 
                              width: `${Math.min(Math.abs(dashboardData.revenue_comparison.growth.orders_growth), 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
