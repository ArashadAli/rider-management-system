export interface Rider {
    id: string;
    name: string;
    email: string;
    mobile: string;
    status: string;
    availability: string;
    vehicle_type: string | null;
    vehicle_number: string | null;
    profile_image_url: string | null;
    created_at: string;
    updated_at: string;
}


export interface RiderResponse {
    success: boolean;
    message: string;
    data: {
        riders: Rider[];
    },
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    }
}

export interface OneRiderResponse {
    success: boolean;
    message: string;
    data: {
        rider: Rider;
    }
}

export interface CreateRiderResponse {
    name: string;
    email: string;
    mobile: string;
    vehicle_type?: string;
    vehicle_number?: string;
    profile_image_url?: string;
}


export interface UpdateRiderStatusResponse {
    success: boolean;
    message: string;
}
