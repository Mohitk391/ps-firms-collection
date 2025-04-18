const UserReducer = (userState, action) => {
    switch(action.type){
        case "SET_USER":
            console.log(action.value);
            return {...userState, user: action.value, isUserLoggedIn: true};
        case "UNSET_USER":
            return {...userState, user: null, isUserLoggedIn: false};
        default: 
            return userState;
    }
}

export {UserReducer}