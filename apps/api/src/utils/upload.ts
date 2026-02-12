import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "../../uploads";

const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
        const subfolder = file.fieldname === "profile" ? "profile" : "menu/food";
        cb(null, path.resolve(__dirname, "../..", UPLOAD_DIR, subfolder));
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${randomUUID()}${ext}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Format file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF."
            )
        );
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
});
