import { configureStore, createStore, Dispatch } from "@reduxjs/toolkit";
import {

    allRpcEndpoints,
    allSubgraphEndpoints,
    createApiWithReactHooks,
    initializeRpcApiSlice,
    initializeSubgraphApiSlice,
    initializeTransactionSlice
} from "@superfluid-finance/sdk-redux";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const rpcApi = initializeRpcApiSlice(createApiWithReactHooks).injectEndpoints(allRpcEndpoints);
export const subgraphApi = initializeSubgraphApiSlice(createApiWithReactHooks).injectEndpoints(allSubgraphEndpoints);
export const transactions = initializeTransactionSlice();

export const store = configureStore({
    reducer: {
        [rpcApi.reducerPath]: rpcApi.reducer,
        [subgraphApi.reducerPath]: subgraphApi.reducer,
        sfTransactions: transactions.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(rpcApi.middleware)
            .concat(subgraphApi.middleware),
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAppDispatch = () => useDispatch<Dispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;