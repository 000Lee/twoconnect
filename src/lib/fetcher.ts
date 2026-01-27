export const fetcher = async (url: string) => {
   const res = await fetch(url, { credentials: 'include' })
   if (!res.ok) {
      const error = new Error('API 요청 실패')
      throw error
   }
   return res.json()
}
