import { api } from "./api";

export type NoticeStatus = 0 | 1 | 2;
export type NoticePriority = 1 | 2 | 3 | 4;

export interface Notice {
  notice_id: number;
  notice_title: string;
  notice_content: string;
  notice_date: string;
  notice_status: NoticeStatus;
  notice_priority: NoticePriority;
}

export interface ListNoticesResponse {
  notices: Notice[];
  total: number;
  page: number;
  limit: number;
}

interface ListNoticesParams {
  page?: number;
  limit?: number;
  notice_title?: string;
  notice_status?: NoticeStatus;
  includeDeleted?: boolean;
  notice_priority?: NoticePriority;
}

export async function listNotices(params: ListNoticesParams = {}) {
  const response = await api.get<ListNoticesResponse>("/notices/listNotices", {
    params,
  });

  return response.data;
}