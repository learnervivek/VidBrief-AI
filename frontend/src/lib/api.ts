export const BASE_URL = "http://localhost:8000";
const API_BASE_URL = `${BASE_URL}/api/v1/videos`;
const AUTH_BASE_URL = `${BASE_URL}/api/v1/auth`;

export interface TimestampedSummaryPoint {
    timestamp: string;
    seconds: number;
    text: string;
}

export interface VideoProcessingResponse {
    id: number;
    filename: string;
    file_path: string;
    status: string;
    transcript?: string;
    summary?: string;
    timestamped_summary?: TimestampedSummaryPoint[];
    thumbnail_path?: string;
    created_at: string;
    updated_at: string;
}

function getAuthHeader(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    return token ? { "Authorization": `Bearer ${token}` } : {};
}

export async function login(email: string, password: string): Promise<string> {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error("Invalid email or password");
    }

    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    return data.access_token;
}

export async function signup(email: string, password: string): Promise<any> {
    const response = await fetch(`${AUTH_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Signup failed");
    }

    return response.json();
}

export function logout() {
    localStorage.removeItem("token");
}

export function isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
}

export async function uploadVideo(file: File): Promise<VideoProcessingResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: { ...getAuthHeader() },
        body: formData,
    });

    if (response.status === 401) {
        logout();
        window.location.href = "/login";
        throw new Error("Session expired");
    }

    if (!response.ok) {
        throw new Error("Upload failed");
    }

    return response.json();
}

export async function getVideoStatus(id: number): Promise<VideoProcessingResponse> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        headers: { ...getAuthHeader() },
    });

    if (response.status === 401) {
        logout();
        window.location.href = "/login";
        throw new Error("Session expired");
    }

    if (!response.ok) {
        throw new Error("Failed to fetch status");
    }

    return response.json();
}

export async function getAllVideos(): Promise<VideoProcessingResponse[]> {
    const response = await fetch(`${API_BASE_URL}/`, {
        headers: { ...getAuthHeader() },
    });

    if (response.status === 401) {
        logout();
        window.location.href = "/login";
        throw new Error("Session expired");
    }

    if (!response.ok) {
        throw new Error("Failed to fetch videos");
    }

    return response.json();
}
