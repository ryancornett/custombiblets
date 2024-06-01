
import { Options } from "./Options";
export class Plan {
    Name: string = "Your_plan_name";
    Books: string[];
    StartDate: Date;
    EndDate: Date;
    ReadingTime: string;
    ReadingDays: string[];
  
    constructor() {
      this.Name = "Your_plan_name";
      this.Books = [];
      this.StartDate = new Date();
      this.EndDate = new Date(this.StartDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      this.ReadingTime = Options.Times[25];
      this.ReadingDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    }
}