export type Role = "Borrower" | "Lender" | "Admin";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  creditScore?: number;
  riskTier?: string;
  kycVerified?: boolean;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  tokenExpiresAtUtc?: string | null;
  refreshTokenExpiresAtUtc?: string | null;
  profile: Profile | null;
}

// Responses (as per backend)
export interface LoginResponse {
  token: string;
  tokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
  profile: Profile;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}
