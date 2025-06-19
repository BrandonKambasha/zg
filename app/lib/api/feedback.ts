import axios from "../axios"
import type { Feedback, FeedbackData, FeedbackStatus } from "../../Types"

export const submitFeedback = async (data: FeedbackData): Promise<Feedback> => {
  try {
    // Ensure user_id is properly formatted and included in the request
    const formattedData = {
      ...data,
      user_id: data.user_id ? String(data.user_id) : undefined,
    }

    const response = await axios.post("/feedback", formattedData)
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

export const getFeedbackById = async (id: string | number): Promise<Feedback> => {
  try {
    const response = await axios.get(`/feedback/${id}`)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch feedback")
  }
}

export const updateFeedbackStatus = async (
  id: string | number,
  status: FeedbackStatus,
  admin_notes?: string,
): Promise<Feedback> => {
  try {
    const response = await axios.put(`/feedback/${id}`, { status, admin_notes })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update feedback status")
  }
}

export const deleteFeedback = async (id: string | number): Promise<void> => {
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
