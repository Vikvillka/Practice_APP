import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import axiosBaseQuery from '../http/axiosBaseQuery'

export const centerAPI = createApi({
    reducerPath: 'centerAPI',
    baseQuery: axiosBaseQuery({ baseUrl: 'https://localhost:7066/api/center' }),
    endpoints: (build) => ({
        fetchAllCenters: build.query({
            query: () => {
                return {
                    url: `/`
                }
            }
        }),
        fetchCenterByID: build.query({
            query: (centerID) => {
                return {
                    url: `/${centerID}`
                }
            }
        }),
        createCenter: build.mutation({
            query: (data) =>{
                return {
                    url: `/`,
                    method: 'POST',
                    data: data
                }
            }
        }),
        updateCenter: build.mutation({
            query: (data) =>{
                const { centerId, centerData } = data
                return {
                    url: `/${centerId}`,
                    method: 'PUT',
                    data: centerData
                }
            }
        }),
        deleteCenter: build.mutation({
            query: (centerID) => {
                return {
                    url: `/${centerID}`,
                    method: 'DELETE'
                }
            }
        })
    })
});