const axios = require('axios').default;
const qs = require('qs');
const prompt = require('prompt');
const util = require('util');

const MOSQUE_ID_MCA = 696;
const PRAYERS_DAILY = ['Fajr', 'Duhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYERS_JUMMAH = ['1st Jumuah', '2nd Jumuah', '3rd Jumuah']
const DAY_FRIDAY = 5;
const DATE_TODAY = 'today';
const DATE_TOMORROW = 'tomorrow';
const DATE_OVERMORROW = 'overmorrow'
const PRAYER_ALL = 'all';
const PRAYER_DUHR = 'Duhr';

const argv = require('yargs')
    .option('prayer', {
        alias: 'p',
        describe: 'choose your prayer',
        choices: PRAYERS_DAILY.concat(PRAYERS_JUMMAH)
            .map(p => p.toLocaleLowerCase())
            .concat(PRAYER_ALL)
    })
    .option('mosque', {
        alias: 'm',
        type: 'number',
        describe: 'mosque id to signup with'
    })
    .option('date', {
        alias: 'd',
        describe: 'date to signup for',
        choices: ['today', 'tomorrow', 'overmorrow']
    })
    .option('name', {
        alias: 'n',
        describe: 'name of the person',
    })
    .option('email', {
        alias: 'e',
        describe: 'email of the person',
    })
    .option('cell', {
        alias: 'c',
        describe: 'cell no. of the person',
    })
    .demandOption(['prayer'])
    .help()
    .argv;

main(argv);

async function main(argv) {
    prompt.start();
    const fillObj = util.promisify(prompt.addProperties);

    const date = getDate(argv.date || (prayer == PRAYER_ALL ? DATE_TOMORROW : DATE_TODAY));
    const prayer = capitalize(argv.prayer);
    const person = {
        name: argv.name,
        email: argv.email,
        cell: argv.cell
    };
    const mosque = argv.mosque || MOSQUE_ID_MCA;

    if (!person.name || !person.email || !person.cell) {
        await fillObj(person, ['name', 'email', 'cell']);
    }

    console.log(`Signing up ${person.name} for ${prayer} prayer(s) ${formatDate(date)}\n`);

    if (prayer == 'All')
        signupAll(date, mosque, person);
    else
        signupOne(date, mosque, prayer, person);
}

function capitalize(word) {
    return word.split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function getDate(name) {
    const date = new Date();
    const delta = [DATE_TODAY, DATE_TOMORROW, DATE_OVERMORROW].indexOf(name);

    date.setDate(new Date().getDate() + delta);
    date.setHours(0, 0, 0, 0); // midnight

    return date;
}

async function signupAll(date, mosque, person) {
    for (const prayer of PRAYERS_DAILY)
        await signupOne(date, mosque, prayer, person);
}

async function signupOne(date, mosque, prayer, person) {
    prayer = validatePrayer(date, prayer);

    try {
        const resp = await register(date, mosque, prayer, person)
        if (resp.data == '0')
            console.log(`You're already signed up for ${prayer} on ${formatDate(date)}`);
        else if (resp.data == '2')
            console.log(`Sorry, the registration is full for ${prayer} on ${formatDate(date)}`);
        else
            console.log(resp.data);
    }
    catch (err) {
        console.log(err.message);
    }

}

function register(date, mosque, prayer, person) {
    const dateStr = formatDate(date);
    return axios.post('https://www.norcalcouncil.org/wp-admin/admin-ajax.php',
        qs.stringify(
            {
                action: 'my_namaz_book_seat',
                masjid_id: mosque,
                date_namaz: dateStr,
                namaz_id: prayer,
                person_name: person.name,
                email_address: person.email,
                contact_number: person.cell
            }))
}

function validatePrayer(date, prayer) {
    if (date.getDay() == DAY_FRIDAY && prayer == PRAYER_DUHR) {
        prayer = PRAYERS_JUMMAH[0];
    }
    else if (date.getDay() != DAY_FRIDAY && PRAYERS_JUMMAH.includes(prayer)) {
        throw new Error("Jummah prayer is on Friday only");
    }

    return prayer;
}

function formatDate(date) {
    return date.toLocaleDateString()
        .split('/')
        .map(n => '0'.repeat(Math.max(0, 2 - n.length)) + n)
        .join('/');
}