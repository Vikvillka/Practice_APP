import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import axiosBaseQuery from '../http/axiosBaseQuery'

export const trainerAPI = createApi({
    reducerPath: 'trainerAPI',
    baseQuery: axiosBaseQuery({ baseUrl: 'https://localhost:7066/api/trainer' }),
    endpoints: (build) => ({
        fetchAllTrainers: build.query({
            query: () => {
                return {
                    url: `/`
                }
            }
        }),
        fetchTrainerByID: build.query({
            query: (userID) => {
                return {
                    url: `/${userID}`
                }
            }
        }),
        createTrainer: build.mutation({
            query: (data) =>{
                return {
                    url: `/`,
                    method: 'POST',
                    data: data,
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            }
        }),
        updateTrainer: build.mutation({
            query: (data) =>{
                const { userID, trainerData } = data
                return {
                    url: `/${userID}`,
                    method: 'PUT',
                    data: trainerData,
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            }
        }),
        deleteTrainer: build.mutation({
            query: (userID) => {
                return {
                    url: `/${userID}`,
                    method: 'DELETE'
                }
            }
        })
    })
});