export interface Building {
  ids: string;
  names: string;

  idmodir: string;
  namemodir: string;

  idcity: string;
  namecity: string;

  nameostan: string;
  codeostan: string;
}

export interface PreviousManagerBuilding {
  ids: string;
  names: string;

  idmodir: string;
  namemodir: string;

  idcity: string;
  namecity: string;

  nameostan: string;
  codeostan: string;
}

export interface Unit {
  idv: string;
  namev: string;

  malek: string;
  saken: string;

  idmodir: string;
  namemodir: string;

  ids: string;
  names: string;

  idcity: string;
  namecity: string;

  nameostan: string;
  codeostan: string;
}

export interface BuildingApiResult {
  buildings: Building[];
  previousManagerBuildings: PreviousManagerBuilding[];
  units: Unit[];
}