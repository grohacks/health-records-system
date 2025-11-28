import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./slices/authSlice";
import medicalRecordsReducer from "./slices/medicalRecordsSlice";
import labReportsReducer from "./slices/labReportsSlice";
import prescriptionsReducer from "./slices/prescriptionsSlice";
import usersReducer from "./slices/usersSlice";
import appointmentsReducer from "./slices/appointmentsSlice";
import notificationsReducer from "./slices/notificationsSlice";
import chatbotReducer from "./slices/chatbotSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    medicalRecords: medicalRecordsReducer,
    labReports: labReportsReducer,
    prescriptions: prescriptionsReducer,
    users: usersReducer,
    appointments: appointmentsReducer,
    notifications: notificationsReducer,
    chatbot: chatbotReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          "labReports/downloadFile/fulfilled",
          "prescriptions/downloadFile/fulfilled",
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload"],
        // Ignore these paths in the state
        ignoredPaths: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
