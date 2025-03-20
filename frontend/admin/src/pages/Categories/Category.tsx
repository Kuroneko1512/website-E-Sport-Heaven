const Category = () => {


    return (
        <div className="card">
        <div className="card-header">
            <h3 className="card-title">Responsive Hover Table</h3>
            <div className="card-tools">
                <div className="input-group input-group-sm search-box">
                    <input type="text" name="table_search" className="form-control search-input" placeholder="Search" />
                    <div className="input-group-append">
                        <button type="submit" className="btn btn-default search-button">
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div className="card-body table-responsive p-0">
            <table className="table table-hover text-nowrap">
                <thead>
                    <tr>
                        <th className="table-header-id">ID</th>
                        <th className="table-header-user">User</th>
                        <th className="table-header-date">Date</th>
                        <th className="table-header-status">Status</th>
                        <th className="table-header-reason">Reason</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="table-data-id">183</td>
                        <td className="table-data-user">John Doe</td>
                        <td className="table-data-date">11-7-2014</td>
                        <td className="table-data-status"><span className="tag tag-success">Approved</span></td>
                        <td className="table-data-reason">Bacon ipsum dolor sit amet salami venison chicken flank fatback doner.</td>
                    </tr>
                    <tr>
                        <td className="table-data-id">219</td>
                        <td className="table-data-user">Alexander Pierce</td>
                        <td className="table-data-date">11-7-2014</td>
                        <td className="table-data-status"><span className="tag tag-warning">Pending</span></td>
                        <td className="table-data-reason">Bacon ipsum dolor sit amet salami venison chicken flank fatback doner.</td>
                    </tr>
                    <tr>
                        <td className="table-data-id">657</td>
                        <td className="table-data-user">Bob Doe</td>
                        <td className="table-data-date">11-7-2014</td>
                        <td className="table-data-status"><span className="tag tag-primary">Approved</span></td>
                        <td className="table-data-reason">Bacon ipsum dolor sit amet salami venison chicken flank fatback doner.</td>
                    </tr>
                    <tr>
                        <td className="table-data-id">175</td>
                        <td className="table-data-user">Mike Doe</td>
                        <td className="table-data-date">11-7-2014</td>
                        <td className="table-data-status"><span className="tag tag-danger">Denied</span></td>
                        <td className="table-data-reason">Bacon ipsum dolor sit amet salami venison chicken flank fatback doner.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    
    ); 
}

export default Category;