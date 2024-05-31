import { Plan } from "../domain/Plan";
import { Reading } from "../domain/Reading";
import { ICalendar } from "./ICalendar";
import { ReadingFactory } from "./ReadingFactory";


export class CalFile implements ICalendar {
    public async generateCalendar(plan: Plan): Promise<string> {
        let factory = new ReadingFactory();
        let result = await factory.GenerateReadings(plan);
        let dates: string[] = result.Dates || [];
        let readings: Reading[] = result.Readings || [];
        let iCal = this.buildEvents(dates, readings, plan);
        return iCal;
    }

    buildEvents(dates: string[], readings: Reading[], plan: Plan): string {
        let icalBuilder: string[] = [];

        for (let i = 0; i < dates.length; i++) {
            let startString = `${dates[i]} ${plan.ReadingTime}`;
            let start = new Date(startString);
            icalBuilder.push("BEGIN:VEVENT");
            icalBuilder.push(`SUMMARY:${readings[i].ToReadToday}`);
            icalBuilder.push(`DTSTART:${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
            icalBuilder.push("END:VEVENT");
        }

        return icalBuilder.join('\n');
    }
}