import { createApi } from '@reduxjs/toolkit/query/react'
import axiosBaseQuery from '../http/axiosBaseQuery'

export const userAPI = createApi({
    reducerPath: 'userAPI',
    baseQuery: axiosBaseQuery({ baseUrl: 'https://localhost:7066/api/admin/user' }),
    endpoints: (build) => ({
        fetchAllUsers: build.query({
            query: () => {
                return {
                    url: `/`
                }
            }
        }),
        fetchUserByID: build.query({
            query: (userID) => {
                return {
                    url: `/${userID}`
                }
            }
        }),
    })
});