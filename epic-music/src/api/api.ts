import axios from "axios";
import qs from "qs";
import { AxiosInstance, AxiosResponse } from "axios";
import type { FeedPage, ListFeedRequest, TaskStartResponse, TaskStatusResponse, UserInfo } from "../types";

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1_000;

export const BASE_URL = import.meta.env.VITE_API_URL;

function toPascal(s: string) {
  let out = "";
  let upper = false;
  for (let c of s) {
    if (c == "_") {
      upper = true;
    }
    else if (upper) {
      out += `${c.toUpperCase()}`;
      upper = false;
    }
    else {
      out += c;
    }
  }

  return out;
}

async function getToken() {
  let cookie = await cookieStore.get("epic_music_token");
  if (cookie != null) {
    return cookie.value;
  }

  let query = window.location.search;
  if (!query) {
    return null;
  }

  query = query.replace("?", "");

  try {
    for (let q of query.split("&")) {
      let [k, v] = q.split("=");
      if (k.trim() === "token") {
        window.history.pushState("authenticated", "", "/epic-music")
        return v;
      }
    }
  }

  catch {
    return null;
  }

  return null;
}

function convertRecursive(val: any): any {
  if (val instanceof Array) {
    let output = [];
    for (let v of val) {
      output.push(convertRecursive(v));
    }

    return output;
  }

  else if (val instanceof Object) {
    var output: {[k: string]: any} = {};
    for (let [k, v] of Object.entries(val)) {
      output[`${toPascal(k)}`] = convertRecursive(v);
    }
  
    return output;
  }

  return val;
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  withCredentials: true,
  headers: {"Authentication": `Bearer ${await getToken()}`},
  transformResponse: [(data) => {
    let parsedData = JSON.parse(data);
    let output: Record<string, unknown> = convertRecursive(parsedData);

    return output;
  }]
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

const feedCache = new Map<string, FeedPage>();

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

  let response = await api.get<FeedPage>(
    "list",
    {"params": request, "paramsSerializer": stringify}
  );

  const page = response.data;

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

export async function getUserInfo(): Promise<UserInfo> {
  return (await api.get<UserInfo>("user")).data;
}