const fs = require('fs');
const path = require('path');

const aggregateEvents = (events) => {
    const dailySummary = {};

    events.forEach((event) => {
        const userId = event.userId.toString();
        const timestamp = event.timestamp;
        const date = new Date(timestamp * 1000).toISOString().split('T')[0];

        dailySummary[userId] = dailySummary[userId] || { userId, date };
        dailySummary[userId][event.eventType] = (dailySummary[userId][event.eventType] || 0) + 1;
    });

    return Object.values(dailySummary);
};

const readEventsFromFile = (filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
};

const writeSummaryToFile = (filePath, summary) => {
    fs.writeFileSync(filePath, JSON.stringify(summary, null, 2));
};

const updateSummary = (existingSummary, newEvents) => {
    newEvents.forEach((event) => {
        const userId = event.userId.toString();
        const timestamp = event.timestamp;
        const date = new Date(timestamp * 1000).toISOString().split('T')[0];

        existingSummary[userId] = existingSummary[userId] || { userId, date };
        existingSummary[userId][event.eventType] = (existingSummary[userId][event.eventType] || 0) + 1;
    });

    return Object.values(existingSummary);
};

const main = () => {
    const args = process.argv.slice(2);
    if (args.length < 4) {
        console.error('Usage: node aggregateEvents.js -i <input-file> -o <output-file> [--update]');
        process.exit(1);
    }

    let inputFile = null;
    let outputFile = null;
    let update = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-i') {
            inputFile = args[++i];
        } else if (args[i] === '-o') {
            outputFile = args[++i];
        } else if (args[i] === '--update') {
            update = true;
        }
    }

    try {
        const inputEvents = readEventsFromFile(inputFile);

        if (update) {
            const existingSummary = readEventsFromFile(outputFile);
            const updatedSummary = updateSummary(existingSummary, inputEvents);
            writeSummaryToFile(outputFile, updatedSummary);
        } else {
            const dailySummary = aggregateEvents(inputEvents);
            writeSummaryToFile(outputFile, dailySummary);
        }
    } catch (error) {
        console.error(error.message);
    }
};

main();
