export interface BuildingBill {
  unitId: string;
  unitName: string;

  sumPayOwner: string;
  sumPayResident: string;

  sumCostOwner: string;
  sumCostResident: string;

  balanceOwner: string;
  balanceResident: string;

  ownerStatus: string;
  residentStatus: string;
}

export interface UnitBillItem {
  unitId: string;
  unitName: string;

  title: string;
  price: string;

  dateFrom: string;
  dateTo: string;
  saveDate: string;

  person: "مالک" | "ساکن" | string;

  type: "هزینه" | "پرداخت" | string;
}

export interface FundBillItem {
  title: string;

  price: string;

  dateStart: string;
  dateEnd: string;
}