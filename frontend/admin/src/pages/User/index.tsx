import { getUserList, updateUserStatus } from "@app/services/User/Type";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    is_active: boolean;
    account_type: string;
    avatar: string;
    avatar_public_id: string;
    provider: string;
    provider_id: string;
}   

export const UserList = () => {
    const [userList, setUserList] = useState<User[]>([]);
    const fetchUserList = async () => {
        const response = await getUserList();
       
        
        setUserList(response);
    }
    useEffect(() => {
        fetchUserList();
        console.log('User list after update:', userList);
    }, []);
  const handleLockAccount = async (id : number) => {

   await updateUserStatus(id); 
  alert('Khóa tài khoản thành công');
   fetchUserList()

  }
  const handleUnlockAccount = async (id : number) => {

    await updateUserStatus(id); 
    alert('Mở khóa tài khoản thành công');
    fetchUserList()
 
   }

    return (
        <div>
            <h1>Danh sách người dùng</h1>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Loại tài khoản</th>
                        <th>Trạng thái</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {userList.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.account_type}</td>
                            <td>{!user.is_active ? "Không hoạt động" : "Hoạt động"}</td>
                            <td>
                                {!user.is_active ? 
                                <button className="btn btn-danger" onClick={() => handleLockAccount(user.id)}>Khóa tài khoản</button>
                                 : 
                                <button className="btn btn-success" onClick={() => handleUnlockAccount(user.id)} >Mở khóa tài khoản</button>}
                               
                            </td>
                           
                        </tr>
                    ))}

                </tbody>
            </Table>
        </div>
    )
}