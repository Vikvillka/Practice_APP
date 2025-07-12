import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import axiosBaseQuery from '../http/axiosBaseQuery'

export const templateAPI = createApi({
    reducerPath: 'templateAPI',
    baseQuery: axiosBaseQuery({ baseUrl: 'https://localhost:7066/api/template' }),
    endpoints: (build) => ({
        fetchAllTemplates: build.query({
            query: () => {
                return {
                    url: `/`
                }
            }
        }),
        fetchTemplateByID: build.query({
            query: (templateID) => {
                return {
                    url: `/${templateID}`
                }
            }
        }),
        fetchTemplateForTrainerByID: build.query({
            query: (userID) => {
                return {
                    url: `/${userID}/templates`
                }
            }
        }),
        createTemplate: build.mutation({
            query: (data) =>{
                return {
                    url: `/`,
                    method: 'POST',
                    data: data
                }
            }
        }),
        updateTemplate: build.mutation({
            query: (data) =>{
                const { templateID, templateData } = data
                return {
                    url: `/${templateID}`,
                    method: 'PUT',
                    data: templateData
                }
            }
        }),
        deleteTemplate: build.mutation({
            query: (templateID) => {
                return {
                    url: `/${templateID}`,
                    method: 'DELETE',
                    validateStatus: (response, body) => {
                        // Проверяем, не используется ли шаблон
                        if (response.status === 400 && body.message?.includes('используется')) {
                            return false; // Будет обработано как ошибка
                        }
                        return response.status >= 200 && response.status < 300;
                    }
                }
            }
        })
    })
});