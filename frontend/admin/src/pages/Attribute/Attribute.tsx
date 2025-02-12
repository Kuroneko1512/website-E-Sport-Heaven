import {FormComponent} from '../Attribute/FormComponent';
import TableComponent from '../Attribute/TableComponent';
const Attribute = () => {
    return (
        <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Left column */}
            <div className="col-md-6">
              {/* General form elements */}
              <FormComponent />
            </div>
            {/* Right column */}
            <div className="col-md-6">
              {/* Form Element sizes */}
             <TableComponent />
            </div>
          </div>
        </div>
      </section>
       
    )
}

export default Attribute;