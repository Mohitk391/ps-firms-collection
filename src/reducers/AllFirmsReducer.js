
const AllFirmsReducer = (dataState, action) => {
    switch(action.type){
        case "SET_ALLFIRMS":
            return {...dataState, allFirms: addNewRecord(dataState.allFirms, action.value)};
        case "UPDATE_ALLFIRMS":
            return {...dataState, allFirms: updateCollection(dataState.allFirms, action.value)};
        case "REMOVE_ALLFIRMS":
            return {...dataState, allFirms: removeCollection(dataState.allFirms, action.value)};
        default:
            return dataState;
    }
}

const addNewRecord = (allFirms, collections) => {
    collections.forEach(newFirm => {
        if(!allFirms.find(firm => firm.id === newFirm.id)){
            allFirms = [...allFirms, newFirm];
        }
    })
    return allFirms;
}

const updateCollection = (collection, updatedFirm) => {
    return collection.map(firm => firm.id === updatedFirm.id ? updatedFirm : firm);
}

const removeCollection = (collection, removedFirm) => {
    return collection.filter(firm => firm.id !== removedFirm.id);
}

export {AllFirmsReducer}