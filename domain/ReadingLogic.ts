import { Plan } from './Plan';
import { Books } from './Books';

export class ReadingLogic {
  async getDaysInPlan(plan: Plan): Promise<number> {
    const timeDifference = plan.EndDate.getTime() - plan.StartDate.getTime();
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
    return daysDifference + 1;
  }

  async getTotalNumberOfDays(span: number): Promise<number> {
    return await Math.floor(span);
  }

  async getAverageDailyWordCount(daysInPlan: number, totalCount: number): Promise<number> {
    return totalCount / daysInPlan;
  }

  async getTotalChapters(plan: Plan): Promise<number> {
    let total = 0;
    for (const book of plan.Books) {
      const count = Books.NumberOfChapters[book];
      total += count;
    }
    return total;
  }

  async getTotalPlanLength(plan: Plan): Promise<number> {
    let total = 0;
    for (const book of plan.Books) {
      let runningTotal = 0;
      const list = Books.ChapterWordCounts[book];
      for (const num of list) {
        runningTotal += num;
      }
      total += runningTotal;
    }
    return total;
  }
}
