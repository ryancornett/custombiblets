import { Plan } from "../domain/Plan"
export interface ICalendar {
    generateCalendar(plan: Plan): Promise<string>;
}