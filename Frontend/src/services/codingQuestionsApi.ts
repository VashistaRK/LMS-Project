import axios from "axios";
const api = import.meta.env.VITE_API_URL;

export const getCodingQuestions = async () =>
  axios.get(`${api}/api/code`).then((r) => r.data);

export const getCodingQuestionById = async (id: string) =>
  axios.get(`${api}/api/code/${id}`).then((r) => r.data);

export const createCodingQuestion = async (data: any) =>
  axios.post(`${api}/api/code`, data).then((r) => r.data);

export const updateCodingQuestion = async (id: string, data: any) =>
  axios.put(`${api}/api/code/${id}`, data).then((r) => r.data);

export const deleteCodingQuestion = async (id: string) =>
  axios.delete(`${api}/api/code/${id}`).then((r) => r.data);
