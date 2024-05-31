import { Plan } from './Plan';
import { ReadingLogic } from './ReadingLogic';

export class SelectedDates {
  private _plan: Plan;
  private _readingDays: string[];
  private _daysInPlan: number;
  private _logic: ReadingLogic = new ReadingLogic();
  private _calendarFeed: string[] = [];

  constructor(plan: Plan) {
    this._readingDays = plan.ReadingDays;
    this._plan = plan;
  }

  public async getDates(): Promise<string[]> {
    await this.getTotalDays(this._plan);
    let date = new Date(this._plan.StartDate.getTime());

    for (let i = 0; i < this._daysInPlan; i++) {
      for (const day of this._readingDays) {
        if (date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day.toLowerCase()) {
          this._calendarFeed.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
        }
      }
      date.setDate(date.getDate() + 1);
    }
    return this._calendarFeed;
  }

  private async getTotalDays(plan: Plan): Promise<void> {
    const range = await this._logic.getDaysInPlan(plan);
    this._daysInPlan = await this._logic.getTotalNumberOfDays(range);
  }
}