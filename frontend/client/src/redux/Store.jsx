import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./AuthSide"

const store = configureStore({
    reducer:{
        auth: authReducer
    }
})

export default store