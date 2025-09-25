'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseExample() {
   const [data, setData] = useState<any[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      // 예시: 데이터베이스에서 데이터 가져오기
      const fetchData = async () => {
         try {
            // 여기에 실제 테이블 이름을 사용하세요
            // const { data, error } = await supabase
            //   .from('your_table_name')
            //   .select('*')

            // if (error) throw error
            // setData(data || [])

            console.log('Supabase 연결 성공!')
            setData([])
         } catch (error) {
            console.error('데이터 가져오기 오류:', error)
         } finally {
            setLoading(false)
         }
      }

      fetchData()
   }, [])

   if (loading) {
      return <div>로딩 중...</div>
   }

   return (
      <div>
         <h2>Supabase 연결 상태</h2>
         <p>Supabase 클라이언트가 성공적으로 설정되었습니다!</p>
         <p>데이터 개수: {data.length}</p>
      </div>
   )
}
