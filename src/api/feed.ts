import axios from "axios"
import { AxiosInstance } from "axios"
import { AxiosResponse } from "axios"
import type { FeedPage, ListFeedRequest, TaskStartResponse, TaskStatusResponse } from "../types"

const POLL_INTERVAL_MS = 3_000
const POLL_TIMEOUT_MS = 5 * 60 * 1_000

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:5007",
  timeout: 5000,
});

// async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
//   const res = await fetch(`${BASE_URL}/${path}`, init)
//   if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
//   return res.json() as Promise<T>
// }

export async function fetchFeed(request: ListFeedRequest): Promise<AxiosResponse<FeedPage>> {
  return axios.get<FeedPage>("list", {"params": request});
}

export async function pollTask(taskId: string): Promise<AxiosResponse<TaskStatusResponse>> {
  return axios.get<TaskStatusResponse>("poll", {"params": taskId});
}

export async function startSync(): Promise<TaskStatusResponse> {
  const { status, taskId } = (await axios.post<TaskStartResponse>("sync")).data;
  if (status === "error") throw new Error("Sync failed to start");

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise<void>(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
    const result = (await pollTask(taskId)).data;
    if (result.status !== "running") return result;
  }
  throw new Error("Sync timed out after 5 minutes");
}
