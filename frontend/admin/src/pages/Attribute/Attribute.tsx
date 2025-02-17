import { useParams } from "react-router-dom";
import {FormComponent} from '../Attribute/FormComponent';
import TableComponent from '../Attribute/TableComponent';
import EditComponent from '../Attribute/EditComponent';
const Attribute = () => {
   // Lấy id từ URL// Lấy đường dẫn hiện tại
    return (
        <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Left column */}
            <div className="col-md-4">
              {/* General form elements */}
            <FormComponent/>
            </div>
            {/* Right column */}
            <div className="col-md-8">
              {/* Form Element sizes */}
             <TableComponent />
            </div>
          </div>
        </div>
      </section>
       
    )
}

export default Attribute;