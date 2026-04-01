import { z } from "zod";

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const MAX_FILE_SIZE_FREE = 5 * 1024 * 1024; // 5 MB
export const MAX_FILE_SIZE_PREMIUM = 100 * 1024 * 1024; // 100 MB

export const fileUploadSchema = z.object({
  file: z
    .custom<File>()
    .refine((f) => f instanceof File, "Please upload a file.")
    .refine((f) => f.size <= MAX_FILE_SIZE_PREMIUM, "File size must be under 100MB.")
    .refine(
      (f) => ALLOWED_MIME_TYPES.includes(f.type),
      "File type not supported."
    ),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Must contain at least one number."),
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(20, "Message must be at least 20 characters."),
});

export const checkoutSchema = z.object({
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: "You must accept the subscription terms to continue.",
  }),
  couponCode: z.string().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
