import axiosInstance from './index'

const  axiosBaseQuery = ({ baseUrl } = 
    { baseUrl: '' }) =>
    async ({ url, method, data, params, headers }) => {
        try {
            // if (data instanceof FormData) {
            //   delete headers['Content-Type'];
            // }
            const result = await axiosInstance({
              url: baseUrl + url,
              method,
              data,
              params,
              headers,
            })
            return { data: result.data }
          } catch (axiosError) {
            const err = axiosError
            return {
              error: {
                status: err.response?.status,
                data: err.response?.data || err.message,
              },
            }
          }
        }
      
export default axiosBaseQuery;