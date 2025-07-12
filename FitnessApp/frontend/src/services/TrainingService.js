import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import axiosBaseQuery from '../http/axiosBaseQuery'

export const trainingAPI = createApi({
    reducerPath: 'trainingAPI',
    baseQuery: axiosBaseQuery({ baseUrl: 'http://localhost:5000/api/training' }),
    endpoints: (build) => ({
        fetchAllTrainings: build.query({
            query: () => {
                return {
                    url: `/`
                }
            }
        }),
        fetchTrainingByID: build.query({
            query: (trainingID) => {
                return {
                    url: `/${trainingID}`
                }
            }
        }),
        fetchTrainingForTrainerByID: build.query({
            query: (userID) => {
                return {
                    url: `/${userID}/training`
                }
            }
        }),
        createTraining: build.mutation({
            query: (data) =>{
                return {
                    url: `/`,
                    method: 'POST',
                    data: data
                }
            }
        }),
        cancellTraining: build.mutation({
            query: (trainingID) =>{
                return {
                    url: `/${trainingID}/cancell`,
                    method: 'PUT',
                }
            }
        }),
    })
});