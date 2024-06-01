import { Plan } from "../domain/Plan";
import { Reading } from "../domain/Reading";
import { ICalendar } from "./ICalendar";
import { ReadingFactory } from "./ReadingFactory";

class CommaSeparated implements ICalendar {
    public async generateCalendar(plan: Plan): Promise<string> {
        let factory = new ReadingFactory();
        var result = await factory.GenerateReadings(plan);
        let dates: string[] = result.Dates || [];
        var readings: Reading[] = result.Readings || [];

        var csv = "Date,Reading";
        for (let i : number = 0; i < dates.length; i++) {
            let date = dates[i].split(",");
            csv += `\n${date[0]},\"${readings[i].ToReadToday}\"`;
        }
        return csv;
    }
}

export { CommaSeparated };