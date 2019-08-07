const filterScheme = {
    name: {
        first: 'string',
        last: 'string',
    },
    phone: 'string',
    address: {
        zip: 'string',
        city: 'string',
        country: 'string',
        street: 'string',
    },
    email: 'string',
};

const _validateData = (data, dataScheme) => {
    let foundOne = false;

    for (key in data) {
        const schemeKeyType = typeof dataScheme[key];
        if (!schemeKeyType) {
            throw new Error(
                `Data object contains non-allowed property '${key}'!`
            );
        }

        const dataKeyType = typeof data[key];
        if (dataKeyType !== schemeKeyType) {
            throw new TypeError(
                `Specified '${key}' property must be ${schemeKeyType} type, but ${dataKeyType}!`
            );
        }

        if (dataKeyType === 'object') {
            _validateData(data[key], dataScheme[key]);
        } else if (!data[key]) {
            throw new Error(
                `Property '${key}' = ${data[key]}, but can't be empty!`
            );
        }
        foundOne = true;
    }
    if (!foundOne) {
        throw new Error(`Object must have at least one non-empty property!`);
    }
};

const _filterData = (data, filter) => {
    let filterMatched = true;

    for (key in filter) {
        filterMatched =
            typeof filter[key] === 'object'
                ? _filterData(data[key], filter[key])
                : new RegExp(filter[key], 'gi').test(data[key]);
        if (!filterMatched) {
            break;
        }
    }
    return filterMatched;
};

const filterUsers = (users, filter) => {
    let filteredUsers = [];

    users.forEach(user => {
        if (_filterData(user, filter)) {
            filteredUsers.push(user);
        }
    });
    return filteredUsers;
};

const validateFilter = filterData => _validateData(filterData, filterScheme);

module.exports = { validateFilter, filterUsers };
