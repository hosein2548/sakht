export type PaymentStatus =
  | "درحال بررسی"
  | "تایید شده"
  | "رد شده"
  | string;

export interface Payment {
  idp: string;

  idupay: string;

  ids: string;

  idv: string;

  namevahed: string;

  title: string;

  datepay: string;

  datesave: string;

  price: string;

  paymentType: string;

  payer: string;

  status: PaymentStatus;

  description: string;

  receipt: string;
}