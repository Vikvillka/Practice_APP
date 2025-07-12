import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { userAPI } from "../services/UserService";
import { centerAPI } from "../services/CenterService";
import { trainerAPI } from "../services/TrainerService";
import { trainingAPI } from "../services/TrainingService";
import { templateAPI } from "../services/TemplateService";
import { orderAPI } from "../services/OrderService";

const rootReducer = combineReducers({
    [userAPI.reducerPath]: userAPI.reducer,
    [centerAPI.reducerPath]: centerAPI.reducer,
    [trainerAPI.reducerPath]: trainerAPI.reducer,
    [trainingAPI.reducerPath]: trainingAPI.reducer,
    [templateAPI.reducerPath]: templateAPI.reducer,
    [orderAPI.reducerPath]: orderAPI.reducer,
})

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(
                userAPI.middleware, 
                centerAPI.middleware, 
                trainerAPI.middleware,
                trainingAPI.middleware,
                templateAPI.middleware,
                orderAPI.middleware
            )
    })
}
