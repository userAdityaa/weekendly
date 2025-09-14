export interface UserData {
  name: string;
  gender: 'male' | 'female';
  hobby: string;
  totalPlansMade: number;
  mainPlanList: MainPlan[];
  friendList: string[];
  locations: string[];
}

export interface MainPlan {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  subPlans: SubPlan[];
  isPublic: boolean;
}

export interface SubPlan {
  id: string;
  activities: string[];
  location: string;
  locationDetails?: {
    lat: number;
    lng: number;
  };
  friendList: string[];
  timings: {
    start: string | "";
    end: string | "";
  };
  notes: string;
}

export interface LocationPoint {
  name: string;
  lat: number;
  lng: number;
  timesVisited: number;
}