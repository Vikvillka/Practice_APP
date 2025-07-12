import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import axiosBaseQuery from '../http/axiosBaseQuery'

export const orderAPI = createApi({
    reducerPath: 'orderAPI',
    baseQuery: axiosBaseQuery({ baseUrl: 'http://localhost:5000/api/order' }),
    endpoints: (build) => ({
        fetchAllOrders: build.query({
            query: () => {
                return {
                    url: `/`
                }
            }
        }),
        fetchOrderByID: build.query({
            query: (orderID) => {
                return {
                    url: `/${orderID}`
                }
            }
        }),
        fetchOrderForUserByID: build.query({
            query: (userID) => {
                return {
                    url: `/${userID}/orders`
                }
            }
        }),
        fetchOrderForTrainingByID: build.query({
            query: (trainingID) => {
                return {
                    url: `/${trainingID}/trainingorders`
                }
            }
        }),
        createOrder: build.mutation({
            query: (data) =>{
                return {
                    url: `/`,
                    method: 'POST',
                    data: data
                }
            }
        }),
        cancelOrder: build.mutation({
            query: (orderID) => {  // Изменено - принимаем только orderID
                return {
                    url: `/${orderID}/cancel`,  // Добавлен /cancel
                    method: 'PUT',
                }
            }
        })
    })
});