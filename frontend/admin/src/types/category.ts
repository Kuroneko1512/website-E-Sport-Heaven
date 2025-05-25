export interface Category {
    id: number;
    name: string;
    description: string;
    parent_id: number | null;
    parent_category?: Category | null;
    products_count?: number;
    subcategories_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface CategoryResponse {
    data: Category[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface CategoryFormData {
    name: string;
    description?: string;
    parent_id?: number | null;
} 