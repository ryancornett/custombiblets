import { Plan } from "../domain/Plan";
import { Reading } from "../domain/Reading";
import { ReadingFactory } from "./ReadingFactory";


export class TextFile {
    public async generateCalendar(plan: Plan): Promise<{}> {
        let factory = new ReadingFactory();
        const result = await factory.GenerateReadings(plan);
        let obj = {
            name: `${plan.Name}`
        };
        for (let i : number = 0; i < result.Dates!.length; i++) {
            let date = result.Dates![i].split(",");
            obj[`${date[0]}`] = `${result.Readings![i].ToReadToday}`;
        }
        return obj;
    }
}
