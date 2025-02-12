// src/api/attributeApi.ts
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/attribute';

export interface Attribute {
  id?: number;
  name: string;
  description?: string;
  // Allow additional properties
}

export const getAttributes = async (): Promise<Attribute[]> => {
  try {
    const response = await axios.get<Attribute[]>(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching attributes:', error);
    throw error;
  }
};

export const createAttribute = async (attribute: FormData): Promise<Attribute> => {
  try {
    const response = await axios.post<Attribute>(API_URL, attribute, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating attribute:', error);
    throw error;
  }
};

export const updateAttribute = async (id: number, attribute: Partial<Attribute>): Promise<Attribute> => {
  try {
    const response = await axios.put<Attribute>(`${API_URL}/${id}`, attribute);
    return response.data;
  } catch (error) {
    console.error('Error updating attribute:', error);
    throw error;
  }
};

export const deleteAttribute = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Error deleting attribute:', error);
    throw error;
  }
};