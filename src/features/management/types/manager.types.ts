export type ManagerRole =
  | "مدیر"
  | "مدیر پیشنهادی"
  | "مدیریت قبلی";

export interface Manager {
  mobile: string;
  name: string;

  datestart: string;
  dateend: string;

  statemodir: ManagerRole;
}