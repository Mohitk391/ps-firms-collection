const DatarReducer = (dataState, action) => {
    switch(action.type){
        case "SET_DATAR":
            return {...dataState, datar: addNewRecord(dataState.datar, action.value)};
        case "UPDATE_DATAR":
            return {...dataState, datar: updateCollection(dataState.datar, action.value)};
        case "REMOVE_DATAR":
            return {...dataState, datar: removeCollection(dataState.datar, action.value)};
        default:
            return dataState;
    }
}

const addNewRecord = (datar, collections) => {
    collections.forEach(newFirm => {
        if(!datar.find(firm => firm.id === newFirm.id)){
            datar = [...datar, newFirm];
        }
    })
    return datar;
}

const updateCollection = (collection, updatedFirm) => {
    return collection.map(firm => firm.id === updatedFirm.id ? updatedFirm : firm);
}

const removeCollection = (collection, removedFirm) => {
    return collection.filter(firm => firm.id !== removedFirm.id);
}

export {DatarReducer}