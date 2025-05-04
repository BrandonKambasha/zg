import axios from "../axios"

interface FeedbackData {
  type: string
  subject: string
  message: string
  user_id?: string | number
}

interface Feedback extends FeedbackData {
  id: string
  created_at: string
  updated_at: string
  status: string
  admin_notes?: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export const submitFeedback = async (data: FeedbackData): Promise<Feedback> => {
  try {
    const response = await axios.post("/feedback", data)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to submit feedback")
  }
}

export const getFeedback = async (): Promise<Feedback[]> => {
  try {
    const response = await axios.get("/feedback")
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch feedback")
  }
}

export const getMyFeedback = async (): Promise<Feedback[]> => {
  try {
    const response = await axios.get("/my-feedback")
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch your feedback")
  }
}

export const getFeedbackById = async (id: string): Promise<Feedback> => {
  try {
    const response = await axios.get(`/feedback/${id}`)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch feedback")
  }
}

export const updateFeedbackStatus = async (id: string, status: string, admin_notes?: string): Promise<Feedback> => {
  try {
    const response = await axios.put(`/feedback/${id}`, { status, admin_notes })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update feedback status")
  }
}

export const deleteFeedback = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/feedback/${id}`)
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete feedback")
  }
}

export const getFeedbackStatistics = async (): Promise<any> => {
  try {
    const response = await axios.get("/feedback/statistics")
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch feedback statistics")
  }
}
