import type { AxiosResponse } from 'axios'
import type { ApiSuccessResponse } from '../types/api.types'

export function unwrapApiData<T>(response: AxiosResponse<ApiSuccessResponse<T>>) {
  return response.data.data
}
