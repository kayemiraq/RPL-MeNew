export * from "./validators";

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ============================================================
// Constants
// ============================================================

export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    OWNER: "OWNER",
    MANAGER: "MANAGER",
} as const;

export const ORDER_STATUSES = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    PREPARING: "PREPARING",
    READY: "READY",
    SERVED: "SERVED",
    CANCELLED: "CANCELLED",
} as const;

export const COLORS = {
    slateBlue: "#7192A1",
    cream: "#EADFCB",
    terracotta: "#BC5528",
    camel: "#C08E66",
    darkNavy: "#042842",
    offWhite: "#F3EEE8",
} as const;
