
export interface Employee {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  members: Employee[];
}

export type View = 'input' | 'raffle' | 'grouping';

export interface AppState {
  employees: Employee[];
  winners: Employee[];
  groups: Group[];
  view: View;
}
