// Admin 권한 부여 스크립트
// 사용법: node scripts/make-admin.js <email>

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
   console.error('❌ 환경변수가 설정되지 않았습니다.')
   console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.')
   process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function makeAdmin(email) {
   try {
      console.log(`🔍 ${email} 사용자를 찾는 중...`)

      // 사용자 찾기
      const { data: user, error: findError } = await supabase.from('users').select('id, email, nickname, is_admin').eq('email', email).single()

      if (findError || !user) {
         console.error(`❌ 사용자를 찾을 수 없습니다: ${email}`)
         return
      }

      if (user.is_admin) {
         console.log(`✅ ${user.nickname}(${user.email})은 이미 admin입니다.`)
         return
      }

      // Admin 권한 부여
      const { error: updateError } = await supabase.from('users').update({ is_admin: true }).eq('id', user.id)

      if (updateError) {
         console.error(`❌ Admin 권한 부여 실패:`, updateError.message)
         return
      }

      console.log(`✅ ${user.nickname}(${user.email})에게 admin 권한을 부여했습니다.`)
   } catch (error) {
      console.error('❌ 오류 발생:', error.message)
   }
}

// 명령행 인수 확인
const email = process.argv[2]

if (!email) {
   console.log('사용법: node scripts/make-admin.js <email>')
   console.log('예시: node scripts/make-admin.js admin@example.com')
   process.exit(1)
}

makeAdmin(email)
