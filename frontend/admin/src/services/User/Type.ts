export interface User {
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

export interface UserList {
    data: User[];
}


export const getUserList = async () => {
    const response = await fetch('http://localhost:8000/api/users');
    return response.json();
}
