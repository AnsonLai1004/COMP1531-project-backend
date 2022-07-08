"use strict";
exports.__esModule = true;
exports.setData = exports.getData = void 0;
var data = {
    users: [],
    channels: [],
    dms: [],
    tokens: [],
    lastAuthUserId: 0,
    lastChannelId: 0,
    lastDMId: 0,
    lastMessageId: 0
};
// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1
/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/
// Use get() to access the data
function getData() {
    return data;
}
exports.getData = getData;
// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData) {
    data = newData;
}
exports.setData = setData;
