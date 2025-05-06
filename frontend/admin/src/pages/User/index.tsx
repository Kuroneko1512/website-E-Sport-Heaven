import { getUserList } from "@app/services/User/Type";
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

interface UserList {
    data: User[];
}


export const UserList = () => {
    const [userList, setUserList] = useState<UserList>({data: []});
    const fetchUserList = async () => {
        const response = await getUserList();
        setUserList(response.data);
    }
    useEffect(() => {
        fetchUserList();
    }, []);
    return (
        <div>
            <h1>User List</h1>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {userList.data.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                        </tr>
                    ))} 
                </tbody>
            </Table>
        </div>
    )
}