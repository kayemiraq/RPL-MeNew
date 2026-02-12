const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (multipart)
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_URL}${url}`, { ...options, headers });

    if (res.status === 401) {
        // Try refresh token
        const refreshToken =
            typeof window !== "undefined"
                ? localStorage.getItem("refreshToken")
                : null;

        if (refreshToken) {
            const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                localStorage.setItem("accessToken", refreshData.data.accessToken);
                localStorage.setItem("refreshToken", refreshData.data.refreshToken);

                headers["Authorization"] = `Bearer ${refreshData.data.accessToken}`;
                return fetch(`${API_URL}${url}`, { ...options, headers });
            }
        }

        // Redirect to login
        if (typeof window !== "undefined") {
            localStorage.clear();
            window.location.href = "/";
        }
    }

    return res;
}

export const api = {
    get: (url: string) => fetchWithAuth(url),
    post: (url: string, body?: unknown) =>
        fetchWithAuth(url, {
            method: "POST",
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),
    patch: (url: string, body?: unknown) =>
        fetchWithAuth(url, {
            method: "PATCH",
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),
    delete: (url: string) => fetchWithAuth(url, { method: "DELETE" }),
};
