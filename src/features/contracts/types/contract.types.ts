export type ContractState =
  | "فعال"
  | "فسخ شده"
  | "پایان یافته"
  | "حذف شده"
  | string;

export interface ContractItem {
  idc: string;
  ids: string;
  idv: string;

  subject: string;

  startDate: string;
  endDate: string;

  price: string;

  address: string;
  phone: string;

  counterparty: string;

  description: string;

  state: ContractState;

  terminateDate: string;
  terminateReason: string;

  receipt: string;
}