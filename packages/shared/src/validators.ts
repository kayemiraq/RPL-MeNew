import { z } from "zod";

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const loginSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    role: z.enum(["OWNER", "MANAGER"]),
    tenantId: z.string().uuid().optional(),
});

// ============================================================
// TENANT SCHEMAS
// ============================================================

export const createTenantSchema = z.object({
    name: z.string().min(2, "Nama tenant minimal 2 karakter"),
    slug: z
        .string()
        .min(2)
        .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan dash"),
});

export const updateTenantSchema = createTenantSchema.partial().extend({
    status: z.enum(["ACTIVE", "SUSPENDED", "DELETED"]).optional(),
});

// ============================================================
// STORE SCHEMAS
// ============================================================

export const createStoreSchema = z.object({
    name: z.string().min(2, "Nama store minimal 2 karakter"),
    slug: z
        .string()
        .min(2)
        .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan dash"),
    address: z.string().optional(),
    phone: z.string().optional(),
    description: z.string().optional(),
});

export const updateStoreSchema = createStoreSchema.partial();

// ============================================================
// CATEGORY SCHEMAS
// ============================================================

export const createCategorySchema = z.object({
    name: z.string().min(1, "Nama kategori wajib diisi"),
    slug: z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan dash"),
    description: z.string().optional(),
    sortOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ============================================================
// PRODUCT SCHEMAS
// ============================================================

export const createProductSchema = z.object({
    name: z.string().min(1, "Nama produk wajib diisi"),
    slug: z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan dash"),
    description: z.string().optional(),
    price: z.number().positive("Harga harus lebih dari 0"),
    categoryId: z.string().uuid("Category ID tidak valid"),
    isAvailable: z.boolean().optional().default(true),
    sortOrder: z.number().int().min(0).optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ============================================================
// TABLE SCHEMAS
// ============================================================

export const createTableSchema = z.object({
    number: z.number().int().positive("Nomor meja harus positif"),
    label: z.string().optional(),
});

export const updateTableSchema = createTableSchema.partial();

// ============================================================
// ORDER SCHEMAS
// ============================================================

export const createOrderSchema = z.object({
    storeSlug: z.string().min(1),
    tableNumber: z.number().int().positive().optional(),
    guestName: z.string().optional(),
    notes: z.string().optional(),
    items: z
        .array(
            z.object({
                productId: z.string().uuid(),
                quantity: z.number().int().positive(),
                notes: z.string().optional(),
            })
        )
        .min(1, "Minimal 1 item dalam pesanan"),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "SERVED",
        "CANCELLED",
    ]),
});

// ============================================================
// REPORT SCHEMAS
// ============================================================

export const reportQuerySchema = z.object({
    period: z.enum(["daily", "weekly", "monthly"]).default("weekly"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    storeId: z.string().uuid().optional(),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ReportQuery = z.infer<typeof reportQuerySchema>;
