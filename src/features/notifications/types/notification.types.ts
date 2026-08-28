export type NotificationType =
  | "cost"
  | "message"
  | "elanat"
  | "endmidir"
  | "newmidir"
  | "pishnahad"
  | string;

export interface NotificationItem {
  id: string;
  ids: string;
  idv: string;

  naghsh: string;

  noepayam: NotificationType;

  count: string;

  subject: string;

  description: string;

  countall: string;

  naghshsend: string;
}