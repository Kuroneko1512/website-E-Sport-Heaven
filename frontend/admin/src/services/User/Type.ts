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

const API_URL = "http://127.0.0.1:8000/api/v1/user";
export const getUserList = async () => {
    const response = await fetch(API_URL);
    return response.json();
}

export const updateUserStatus = async (id : number) => {
    const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    return response.json();
}
