// Standard API envelope: { success, message, data }
export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data: T;
}
