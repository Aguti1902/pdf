export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "free";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionCurrentPeriodEnd: Date | null;
  stripeCustomerId: string | null;
}

export interface UploadedFile {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  storageKey: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ConversionJob {
  id: string;
  status: "pending" | "processing" | "done" | "failed";
  toolSlug: string;
  inputFileId: string;
  outputFileId: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  trialDays?: number;
  features: string[];
  highlighted?: boolean;
  stripePriceId: string;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export type FileUploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "ready"; file: UploadedFile }
  | { status: "processing" }
  | { status: "done"; outputFile: UploadedFile }
  | { status: "error"; message: string };

export type ToolAction =
  | "add-text"
  | "sign"
  | "draw"
  | "highlight"
  | "annotate"
  | "add-image"
  | "fill-form"
  | "rotate"
  | "delete-page"
  | "reorder";

export interface EditorState {
  activeTool: ToolAction | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  isDirty: boolean;
}
