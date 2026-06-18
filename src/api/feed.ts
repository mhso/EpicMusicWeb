import axios from "axios";
import qs from "qs";
import { AxiosInstance, AxiosResponse } from "axios";
import type { FeedPage, ListFeedRequest, TaskStartResponse, TaskStatusResponse } from "../types";

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1_000;

export const BASE_URL = "http://localhost:5007";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

function toSnake(s: string) {
  let out = "";
  for (let c of s) {
    if (c.toUpperCase() == c) {
      out += `_${c.toLowerCase()}`;
    }
    else {
      out += c;
    }
  }

  return out;
}

function stringify(obj: Record<string, any>) {
  let snakeCased: Record<string, any> = {};
  for (let key of Object.keys(obj)) {
    snakeCased[toSnake(key)] = obj[key];
  }

  return qs.stringify(snakeCased, {"encodeValuesOnly": true, "indices": false});
}

const feedCache = new Map<string, FeedPage>()

function makeCacheKey(request: ListFeedRequest): string {
  const normalized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(request).sort(([a], [b]) => a.localeCompare(b))) {
    normalized[k] = Array.isArray(v) ? [...v].sort() : v;
  }
  return JSON.stringify(normalized);
}

export function clearFeedCache() {
  feedCache.clear();
}

export async function fetchFeed(request: ListFeedRequest): Promise<FeedPage> {
  const key = makeCacheKey(request);
  if (feedCache.has(key)) {
    return feedCache.get(key)!;
  }

  const page = (await api.get<FeedPage>("list", {"params": request, "paramsSerializer": stringify})).data;

  for (const entry of page.entries) {
    if (entry.avatar) {
      entry.avatar = `${BASE_URL}/${entry.avatar}`;
    }
  }

  feedCache.set(key, page);
  return page;
}

export async function pollTask(taskId: string): Promise<AxiosResponse<TaskStatusResponse>> {
  return api.get<TaskStatusResponse>("poll", {"params": {"task_id": taskId}});
}

export async function syncAndWait(): Promise<TaskStatusResponse> {
  const { status, taskId } = (await api.post<TaskStartResponse>("sync")).data;
  if (status === "error") throw new Error("Sync failed to start");

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise<void>(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
    const result = (await pollTask(taskId)).data;
    if (result.status !== "running") {
      clearFeedCache();
      return result;
    }
  }

  throw new Error("Sync timed out after 5 minutes");
}
