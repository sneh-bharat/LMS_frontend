import doctorClient from "./doctorClient";

export interface LoginPayload {
    username: string;
    password: string;
    deviceTypes: string;
    deviceId: string;
}

export interface LoginResponse {
    data: {
        token: string;
        refreshToken: string;
        loginDetails: {
            id: number;
            fullName: string;
            email: string;
            phone: string;
            role: string;
            adminType: string;
            branchId: number | null;
            tenantId: number | null;
        };
    };
    message: string;
    response: boolean;
    status: string;
    timestamp: string;
}

/**
 * Authentication API Service
 */
export const authApi = {
    login: (payload: LoginPayload): Promise<LoginResponse> => {
        return doctorClient.post('/api/v1/auth/login/doctor', payload);
    },
    // Add more auth methods here (e.g., logout, refreshToken)
};
