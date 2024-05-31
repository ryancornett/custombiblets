import { Plan } from '../domain/Plan';
import { Reading } from '../domain/Reading';
import { ReadingLogic } from '../domain/ReadingLogic';
import { SelectedDates } from '../domain/SelectedDates';
import { Books } from '../domain/Books';

export class ReadingFactory {
    private _runningCount: number;
    private _totalDays: number;
    private _averageDailyWordCount: number;
    private _chaptersRemaining: number;
    private _logic: ReadingLogic = new ReadingLogic();
    public SelectedDates?: SelectedDates;
    public dates?: string[];

    private readings: Reading[] = [];

    public async GetPlanData(plan: Plan): Promise<void> {
        this.SelectedDates = new SelectedDates(plan);
        this.dates = await this.SelectedDates.getDates();
        this._runningCount = await this._logic.getTotalPlanLength(plan);
        this._totalDays = await this.dates.length;
        this._averageDailyWordCount = await this._logic.getAverageDailyWordCount(this._totalDays, this._runningCount);
        this._chaptersRemaining = await this._logic.getTotalChapters(plan);
    }

    public async GenerateReadings(plan: Plan): Promise<{ Readings?: Reading[], Dates?: string[] }> {
        this.readings = [];
        await this.GetPlanData(plan);
        let day = 0;
        let daysRemaining = this._totalDays;
        const bookTitlesInPlan = plan.Books;
        const numberOfBooksInPlan = bookTitlesInPlan.length;
        let workingBook = 0;
        let workingChapter = 0;

        while (daysRemaining > 0) {
            day++;
            let wordCount: number;
            const reading = new Reading();
            this.readings.push(reading);
            if (workingBook >= numberOfBooksInPlan) { break; }
            let chaptersInBook = Books.NumberOfChapters[bookTitlesInPlan[workingBook]];
            if (workingChapter >= chaptersInBook) {
                workingBook++;
                if (workingBook >= numberOfBooksInPlan) { break; }
                chaptersInBook = Books.NumberOfChapters[bookTitlesInPlan[workingBook]];
                workingChapter = 0;
            }

            reading.ToReadToday = (bookTitlesInPlan[workingBook] === "Psalms" ? `Psalm ${workingChapter + 1}` : `${bookTitlesInPlan[workingBook]} ${workingChapter + 1}`);
            let currentBookWordCounts = Books.ChapterWordCounts[bookTitlesInPlan[workingBook]];
            wordCount = currentBookWordCounts[workingChapter];

            while (wordCount < (this._runningCount / daysRemaining) - 100) {
                if (daysRemaining === this._chaptersRemaining) { break; }
                workingChapter++;
                this._chaptersRemaining--;
                if (workingChapter >= chaptersInBook) {
                    workingBook++;
                    if (workingBook >= numberOfBooksInPlan) { break; }
                    chaptersInBook = Books.NumberOfChapters[bookTitlesInPlan[workingBook]];
                    workingChapter = 0;
                }
                if (workingBook >= numberOfBooksInPlan) { break; }
                else {
                    reading.ToReadToday += workingChapter === 0 ? `, ${bookTitlesInPlan[workingBook]} ${workingChapter + 1}` : `, ${workingChapter + 1}`;
                    if (workingBook < numberOfBooksInPlan) {
                        currentBookWordCounts = Books.ChapterWordCounts[bookTitlesInPlan[workingBook]];
                        try {
                            wordCount += currentBookWordCounts[workingChapter];
                        } catch (e) {
                            break;
                        }
                    }
                }
            }
            this._runningCount -= wordCount;
            workingChapter++;
            this._chaptersRemaining--;
            if (workingChapter >= chaptersInBook) {
                workingBook++;
                workingChapter = 0;
            }
            daysRemaining--;
        }

        return { Readings: this.readings, Dates: this.dates };
    }
}
