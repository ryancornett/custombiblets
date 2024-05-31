import { Plan } from "./public/domain/Plan";
import { Options } from "./public/domain/Options";
import { Books } from "./public/domain/Books";
import { CommaSeparated } from "./public/factories/CommaSeparated";
import { CalFile } from "./public/factories/CalFile";
import { TextFile } from "./public/factories/TextFile";
let plan = new Plan();
let today = new Date();

const planName = <HTMLInputElement> document.getElementById('plan-name');
planName.addEventListener('input', () => {
    document.title = `Your Plan: ${planName.value}`;
});
const startDate = <HTMLInputElement> document.getElementById('start-date');
const minDate = today;
startDate.min = formatDate(minDate);
const endDate = <HTMLInputElement> document.getElementById('end-date');
minDate.setDate(minDate.getDate() + 14);
endDate.min = formatDate(minDate);
const maxDate = today;
maxDate.setDate(maxDate.getDate() + 730);
startDate.max = formatDate(maxDate);
endDate.max = formatDate(maxDate);

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDate(input: string): Date {
    const [year, month, day] = input.split('-').map(Number);
    return new Date(year, month - 1, day);
}

const timeSelector = <HTMLSelectElement> document.getElementById('time');
for (let i = 0; i < Options.Times.length; i++){
    let opt = document.createElement('option');
    opt.value = Options.Times[i];
    opt.textContent = Options.Times[i];
    timeSelector.appendChild(opt);
}
timeSelector.addEventListener('change', function () {
    plan.ReadingTime = timeSelector.value;
});

const expandOtBtn = document.querySelector('.expand-ot');
expandOtBtn?.addEventListener('click', () => {
    otCheckboxes.classList.toggle('expanded');
    if (expandOtBtn.textContent == "+") { expandOtBtn.textContent = "-"; }
    else { expandOtBtn.textContent = "+"; }
});

const expandNtBtn = document.querySelector('.expand-nt');
expandNtBtn?.addEventListener('click', () => {
    ntCheckboxes.classList.toggle('expanded');
    if (expandNtBtn.textContent == "+") { expandNtBtn.textContent = "-"; }
    else { expandNtBtn.textContent = "+"; }
});

const daysCheckboxes = <HTMLDivElement> document.querySelector('.days-checkboxes');
generateCheckboxes(daysCheckboxes, Options.Days, true);
daysCheckboxes.addEventListener('change', (event: Event) => {
    const target = <HTMLInputElement> event.target;
    if (target && target.type === 'checkbox') {
        const value = target.value;
        if (target.checked) {
            if (!plan.ReadingDays.includes(value)) {
                plan.ReadingDays.push(value);
            }
        } else {
            plan.ReadingDays = plan.ReadingDays.filter(option => option !== value);
        }
    }
});

const otMasterCheckbox = document.getElementById('ot-master-checkbox') as HTMLInputElement;
otMasterCheckbox.addEventListener('change', () => {
    handleMasterCheckboxChange(otMasterCheckbox, otCheckboxes);
})
const otCheckboxes = <HTMLDivElement> document.querySelector('.ot-checkboxes');
generateCheckboxes(otCheckboxes, Books.OldTestament, false);
otCheckboxes.addEventListener('change', (event: Event) => {
    editBooksArray(event);
});

const ntMasterCheckbox = document.getElementById('nt-master-checkbox') as HTMLInputElement;
ntMasterCheckbox.addEventListener('change', () => {
    handleMasterCheckboxChange(ntMasterCheckbox, ntCheckboxes);
})
const ntCheckboxes = <HTMLDivElement> document.querySelector('.nt-checkboxes');
generateCheckboxes(ntCheckboxes, Books.NewTestament, false);
ntCheckboxes.addEventListener('change', (event: Event) => {
    editBooksArray(event);
});

resetValues();

function editBooksArray(event: Event) {
    const target = <HTMLInputElement> event.target;
    if (target && target.type === 'checkbox') {
        const value = target.value;

        if (target.checked) {
            if (!plan.Books.includes(value)) {
                plan.Books.push(value);
            }
        } else {
            plan.Books = plan.Books.filter(option => option !== value);
        }
    }
}

function handleMasterCheckboxChange(target: HTMLInputElement, container: HTMLDivElement) {
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    if (target.checked) {
        checkboxes.forEach((checkbox) => {
            const input = checkbox as HTMLInputElement;
            input.checked = true;
            if (!plan.Books.includes(input.value)) {
                plan.Books.push(input.value);
            }
        });
    } else {
        checkboxes.forEach((checkbox) => {
            const input = checkbox as HTMLInputElement;
            input.checked = false;
            var index = plan.Books.indexOf(input.value);
            if (index !== -1) {
                plan.Books.splice(index, 1);
            } else { plan.Books.pop(); }
        });
    }
}

function generateCheckboxes(container: HTMLDivElement, arr: string[], selected: boolean) {
    for (let i = 0; i < arr.length; i++) {
        let wrapper = <HTMLDivElement> document.createElement('div');
        wrapper.classList.add('checkbox-wrapper');
        let label = document.createElement('label');
        label.htmlFor = arr[i];
        label.appendChild(document.createTextNode(arr[i]));
        let box = document.createElement('input');
        box.type = "checkbox";
        box.name = arr[i];
        box.id = arr[i];
        box.value = arr[i];
        if (selected) { box.checked = true; };
        wrapper.appendChild(box);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    }
}

const csvBtn = <HTMLButtonElement> document.getElementById('csv');
csvBtn.addEventListener('click', async function () {
    setPlanInfo();
    let csvFactory = new CommaSeparated();
    if (await checkForValidPlan()) {
        try {
            let data = await csvFactory.generateCalendar(plan);
            const blob = new Blob([data], { type: 'text/csv' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = `${plan.Name}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch {
            await setAlert("error", "An error occurred. Please try again.");
        }
    }
})

const icalBtn = <HTMLButtonElement> document.getElementById('ical');
icalBtn.addEventListener('click', async function () {
    setPlanInfo();
    let icalFactory = new CalFile;
    if (await checkForValidPlan()) {
        try {
            let data = await icalFactory.generateCalendar(plan);
            let icalContent = `BEGIN:VCALENDAR\nVERSION:2.0\n${data}\nEND:VCALENDAR`;
            const blob = new Blob([icalContent], { type: 'text/calendar' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = `${plan.Name}.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch {
            await setAlert("error", "An error occurred. Please try again.");
        }
    }
})

const printBtn = <HTMLButtonElement> document.getElementById('print');
printBtn.addEventListener('click', async function () {
    setPlanInfo();
    let textFactory = new TextFile();
    if (await checkForValidPlan()) {
        try {
            let data = await textFactory.generateCalendar(plan);
            sessionStorage.setItem('calendarData', JSON.stringify(data));
            window.open('print.html', '_blank');
        } catch {
            await setAlert("error", "An error occurred. Please try again.");
        }
    }
});

const clearBtn = <HTMLButtonElement> document.getElementById('clear');
clearBtn.addEventListener('click', resetValues);

function resetValues() {
    planName.value = plan.Name;
    startDate.value = formatDate(plan.StartDate);
    endDate.value = formatDate(plan.EndDate);
    timeSelector.selectedIndex = 0;
    const dayChecks = daysCheckboxes.querySelectorAll('input[type="checkbox"]');
    dayChecks.forEach((checkbox) => {
        const input = checkbox as HTMLInputElement;
        input.checked = true;
    });
    otMasterCheckbox.checked = false;
    let otChecks = otCheckboxes.querySelectorAll('input[type="checkbox"]');
    ntMasterCheckbox.checked = false;
    let ntChecks = ntCheckboxes.querySelectorAll('input[type="checkbox"]');
    let checkboxes = [...otChecks, ...ntChecks];
    checkboxes.forEach((checkbox) => {
        const input = checkbox as HTMLInputElement;
        input.checked = false;
        var index = plan.Books.indexOf(input.value);
        if (index !== -1) {
            plan.Books.splice(index, 1);
        } else { plan.Books.pop(); }
    });
    plan.Books = [];
}

function setPlanInfo() {
    plan.Name = planName.value;
    plan.StartDate = parseDate(startDate.value);
    plan.EndDate = parseDate(endDate.value);
}

async function checkForValidPlan(): Promise<boolean> {
    if (plan.Name == "") {
        await setAlert("alert", "Please provide a Bible reading plan name.");
        return false;
    }
    else if (plan.ReadingDays.length == 0) {
        await setAlert("alert", "You selected no days of the week to read. Are you trying to get me to divide by zero?");
        return false;
    }
    else if (plan.Books.length == 0) {
        await setAlert("alert", "Don't you think you should add some books?");
        return false;
    }
    else if (getNumberOfDaysInPlan() > getNumberOfChaptersInPlan()) {
        await setAlert("alert", "You have more reading days than chapters to read. Please add more books.");
        return false;
    }
    return true;
}

let alertBox = <HTMLElement> document.querySelector('aside');
async function setAlert(level: string, message: string) {
    alertBox.classList.toggle(level);
    alertBox.textContent = message;
    setTimeout(function() {
        alertBox.classList.toggle(level);
        alertBox.textContent = "";
    }, 3500);
}

function getNumberOfDaysInPlan(): number {
    const timeDifference = plan.EndDate.getTime() - plan.StartDate.getTime();
    return timeDifference / (1000 * 60 * 60 * 24);
}

function getNumberOfChaptersInPlan(): number {
    let total = 0;
    plan.Books.forEach((book) => {
        total += Books.NumberOfChapters[book];
    })
    return total;
}