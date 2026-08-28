export interface UnitDetail {
  idv: string;
  namev: string;

  metter: string;

  bargh: string;
  aab: string;
  gaz: string;

  parking: string;
  anbari: string;

  fullempty: string;

  tozihat: string;

  date: string;
}

export interface UnitPerson {
 idvahed: string;

  phone: string;
  nameuser: string;

  naghsh: "مالک" | "ساکن" | string;

  iduser: string;
  idnaghsh: string;

  datestart: string;

  count: string;
}