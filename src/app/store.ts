import { configureStore } from "@reduxjs/toolkit";
// If you set up the '@' alias → 'src', this works:
import authReducer from "../features/auth/model/auth.slice";
// If you DIDN'T set the alias yet, use this instead:
// import authReducer from "../features/auth/model/auth.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  // middleware & devTools use RTK defaults; customize here if needed
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// (Optional) typed hooks if you want them:
/*
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
*/
