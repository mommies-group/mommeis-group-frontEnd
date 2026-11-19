export type ApiSuccessResponse<T> = {
  success: true
  data: T
  message: string
}

export type ApiErrorBody = {
  success: false
  message: string
  error?: {
    code?: string
    details?: unknown
  }
}

export type ApiRequestOptions = {
  signal?: AbortSignal
}
