const _csvQuotedValue = str =>
    '"' +
    str
        .toString()
        .replace(new RegExp('"', 'g'), '""')
        .replace(new RegExp('\n', 'g'), '\\n') +
    '"';

const _getKeys = (obj, keyArray) => {
    for (key in obj) {
        if (typeof obj[key] === 'object') {
            keyArray = _getKeys(obj[key], keyArray);
        } else {
            keyArray.push(key);
        }
    }
    return keyArray;
};

const _getValues = (obj, valuesArray) => {
    for (key in obj) {
        if (typeof obj[key] === 'object') {
            valuesArray = _getValues(obj[key], valuesArray);
        } else {
            valuesArray.push(_csvQuotedValue(obj[key]));
        }
    }
    return valuesArray;
};

const json2csv = (data, delimiter = ';') => {
    if (data.length == 0) {
        return 'No data';
    } else {
        const firstLine = data[0];
        const csvKeys = _getKeys(firstLine, []);

        let csvData = csvKeys.join(delimiter) + '\n';

        data.forEach(line => {
            let lineValues = _getValues(line, []);
            csvData += lineValues.join(delimiter) + '\n';
        });
        return csvData;
    }
};

module.exports = { json2csv };
