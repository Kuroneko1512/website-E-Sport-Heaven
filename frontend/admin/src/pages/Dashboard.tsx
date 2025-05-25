import { InfoBox } from '@app/components/info-box/InfoBox';
import { ContentHeader, SmallBox } from '@components';
import {
  faBookmark,
  faEnvelope,
  faChartSimple,
  faCartShopping,
  faUserPlus,
  faChartPie,
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
import { Bar, Line, Pie } from 'react-chartjs-2';

// Phải đăng ký các thành phần cần thiết
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement); 

const Dashboard = () => {
  return (
    <div>
      <ContentHeader title="Bảng điều khiển" />

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-3 col-6">
              <SmallBox
                title="New Orders"
                text="150"
                navigateTo="#"
                variant="info"
             
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
                title="Bounce Rate"
                text="53 %"
                navigateTo="#"
                variant="success"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faChartSimple}
                      style={{ fontSize: '62px' }}
                    />
                  ),
                }}
                loading
              />
            </div>
            <div className="col-lg-3 col-6">
              <SmallBox
                title="User Registrations"
                text="44"
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
                loading="dark"
              />
            </div>
            <div className="col-lg-3 col-6">
              <SmallBox
                title="Unique Visitors"
                text="65"
                navigateTo="#"
                variant="danger"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faChartPie}
                      style={{ fontSize: '62px' }}
                    />
                  ),
                  variant: 'success',
                }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                title="Messages"
                text="1,410"
                icon={{
                  content: <FontAwesomeIcon icon={faEnvelope} />,
                  variant: 'info',
                }}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                variant="success"
                title="Messages"
                loading="dark"
                text="1,410"
                icon={{ content: <FontAwesomeIcon icon={faEnvelope} /> }}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                variant="warning"
                title="Messages"
                text="1,410"
                icon={{ content: <FontAwesomeIcon icon={faEnvelope} /> }}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                variant="danger"
                title="Messages"
                text="1,410"
                icon={{ content: <FontAwesomeIcon icon={faEnvelope} /> }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                icon={{
                  content: <FontAwesomeIcon icon={faBookmark} />,
                  variant: 'info',
                }}
                title="Bookmarks"
                text="41,410"
                progressBar={{
                  description: '70% Increase in 30 Days',
                  level: 70,
                  variant: 'success',
                }}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                icon={{ content: <FontAwesomeIcon icon={faBookmark} /> }}
                variant="success"
                title="Bookmarks"
                text="41,410"
                progressBar={{
                  description: '70% Increase in 30 Days',
                  level: 70,
                  variant: 'light',
                }}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                icon={{ content: <FontAwesomeIcon icon={faBookmark} /> }}
                variant="warning"
                title="Bookmarks"
                text="41,410"
                loading
                progressBar={{
                  description: '70% Increase in 30 Days',
                  level: 70,
                  variant: 'dark',
                }}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                icon={{ content: <FontAwesomeIcon icon={faBookmark} /> }}
                variant="danger"
                title="Bookmarks"
                text="41,410"
                progressBar={{
                  description: '70% Increase in 30 Days',
                  level: 70,
                  variant: 'light',
                }}
              />
            </div>
          </div>

        </div>
         <div className="container-fluid">
         <div className="row">
                 <div className="col-lg-8 col-6">
                       <Bar data={{
                    labels: ['a', 'b', 'c'],
                    datasets: [
                      {
                        label: 'Dataset 1',
                        data: [1, 2, 3],
                        backgroundColor: 'red',
                        borderColor: 'red',
                        borderWidth: 1,
                      }
                    ],

                  }}
                  >

                  </Bar>
                 </div>
         </div>
        </div>

        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-8 col-6">
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">Area Chart</h3>

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
                  <Bar data={{
                    labels: ['a', 'b', 'c'],
                    datasets: [
                      {
                        label: 'Dataset 1',
                        data: [1, 2, 3],
                        backgroundColor: 'red',
                        borderColor: 'red',
                        borderWidth: 1,
                      }
                    ],

                  }}

                  >

                  </Bar>
                </div>

              </div>

            </div>
            <div className="col-lg-4 col-6">
          <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">Area Chart</h3>

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
                  <Pie data={{
                    labels: ['a', 'b', 'c'],
                    datasets: [
                      {
                        label: 'Dataset 1',
                        data: [1, 2, 3],
                        backgroundColor: 'red',
                        borderColor: 'red',
                        borderWidth: 1,
                      },
                      {
                        label: 'Dataset 2',
                        data: [3, 2, 1],
                        backgroundColor: 'rgba(54,162,235,0.2)',
                        borderColor: 'rgb(73, 94, 108)',
                        borderWidth: 1,
                      },
                    ],

                  }}

                  >

                  </Pie>
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
