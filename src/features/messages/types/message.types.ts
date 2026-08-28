export interface AnnouncementMessage {
  id: string;

  subject: string;

  message: string;

  date: string;

  senderName: string;
}

export interface PrivateMessage {
  id: string;

  managerMessage: string;

  userMessage: string;

  managerDate: string;

  userDate: string;

  managerName: string;

  userName: string;

  readState: string;
}

export interface MessageUnit {
  idv: string;

  namev: string;

  unreadResident: string;

  unreadManager: string;
}