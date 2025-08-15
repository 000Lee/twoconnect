'use client'
import styled from 'styled-components'

const IMG_CARD_1 = 'https://picsum.photos/seed/card1/800/480'
const IMG_CARD_2 = 'https://picsum.photos/seed/card2/800/480'

export default function Home() {
   return (
      // ...return (
      <Root>
         <Container>
            {/* 전역 헤더는 layout.tsx에서 렌더링됩니다 */}

            {/* decorative background behind content */}
            <BG aria-hidden>
               <BGPattern />
            </BG>

            <Safe>
               <Header>
                  <Chip style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', fontWeight: '600' }}>Connected</Chip>
                  <Chips>
                     {['#FFCDB8', '#FFE9C0', '#E5FFBC', '#D3FFEA', '#D3DFFF', '#E7DDFF', '#FFD9EE', '#EAD2A4', '#C3E38F', '#A6E8C8', '#A8BAE8', '#E8AACC'].map((c, i) => (
                        <Chip key={i} style={{ background: c }} />
                     ))}
                  </Chips>
               </Header>

               <List>
                  <Card>
                     <CardHeader>
                        <span>곰돌이</span>
                        <span>2025.07.29</span>
                        <span>18:39</span>
                     </CardHeader>
                     <CardImage style={{ backgroundImage: `url('${IMG_CARD_1}')` }} />
                     <CardBody>푸른 하늘 아래 펼쳐진 들판엔 바람이 부드럽게 흐르고, 고요한 오후엔 나뭇잎이 속삭이듯 흔들린다.</CardBody>
                     <CardActions>
                        <a>체크</a>
                        <a>책갈피</a>
                        <a>댓글</a>
                        <a>삭제</a>
                        <a>수정</a>
                     </CardActions>
                  </Card>

                  <Card>
                     <CardHeader>
                        <span>곰돌이</span>
                        <span>2025.07.29</span>
                        <span>18:39</span>
                     </CardHeader>
                     <CardImage style={{ backgroundImage: `url('${IMG_CARD_2}')` }} />
                     <CardBody>푸른 하늘 아래 펼쳐진 들판엔 바람이 부드럽게 흐르고…</CardBody>
                     <CardActions>
                        <a>체크</a>
                        <a>책갈피</a>
                        <a>댓글</a>
                        <a>삭제</a>
                        <a>수정</a>
                     </CardActions>
                  </Card>
               </List>
            </Safe>

            <Fab aria-label="새 글">
               <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 5v14M5 12h14" />
               </svg>
            </Fab>
         </Container>
      </Root>
   )
}

/* ========== styled ========== */
const Root = styled.div`
   min-height: 100dvh;
   background: var(--bg);
`
const Container = styled.div`
   position: relative;
   max-width: var(--container-max);
   margin: 0 auto;
   min-height: 100dvh;
`

/* 배경 레이어 */
const BG = styled.div`
   pointer-events: none;
   position: absolute;
   inset: 0;
   z-index: 0;
   overflow: hidden;
`
const BGPattern = styled.div`
   position: absolute;
   inset: 0;
   opacity: 0.55;

   /* 8px 세로/가로 라인 + 40px 굵은 라인으로 그래프 종이 느낌 */
   background-image:
      /* 굵은 라인 */ linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px), /* 얇은 라인 */ repeating-linear-gradient(to right, rgba(0, 0, 0, 0.06) 0 1px, transparent 1px 8px),
      repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 0 1px, transparent 1px 8px);
   background-size: 40px 40px, 40px 40px, /* 굵은 라인 간격 */ 8px 8px, 8px 8px; /* 얇은 라인 간격 */
   background-position: 0 0, 0 0, 0 0, 0 0;
`

/* 콘텐츠 레이어(안전 영역) */
const Safe = styled.div`
   position: relative;
   z-index: 1;
   padding-inline: var(--safe-x);
   //  padding-top: var(--safe-t);

   padding-bottom: clamp(60px, 6vw, 120px);
   display: grid;
   gap: 24px;
   & > :first-child {
      gap: 0px;
   }
`

const Header = styled.header`
   //  padding-top: 60px;
   display: grid;
   gap: 16px;
`
// 상단 헤더 바
// 전역 헤더는 컴포넌트로 분리됨

// 아래 타이틀(바로 아래 얇은 행)
const TitleRow = styled.div`
   height: 28px; /* 스샷처럼 낮은 라인 */
   display: flex;
   align-items: center;
`
const Title = styled.div`
   font-size: 14px; /* 스샷의 작은 'TwoConnect' */
   line-height: 1;
   color: #000;
`

const Chips = styled.div`
   display: flex;
   flex-wrap: wrap;
   //  gap: 8px;
   opacity: 0.8;
`
const Chip = styled.div`
   width: 120px;
   height: 40px;
   line-height: 40px;
   //  border: 1px solid #dcdcdc;
   background: #eee;
   //  border-radius: 8px;
   text-align: center;
`

const List = styled.div`
   display: grid;
   gap: 24px;
   grid-template-columns: 1fr;
   @media (min-width: 900px) {
      grid-template-columns: 1fr;
   }
`

const Card = styled.article`
   width: clamp(280px, 60vw, 560px);
   display: grid;
   grid-template-rows: auto auto 1fr auto;
   border: 1px solid #e5e7eb;
   border-radius: 12px;
   background: #fff;
   overflow: hidden;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`
const CardHeader = styled.div`
   display: flex;
   gap: 20px;
   font-size: 13px;
   padding: 16px 16px 0;
   color: #374151;
`
const CardImage = styled.div`
   margin: 12px 0;
   width: 100%;
   aspect-ratio: 5/3;
   background-size: cover;
   background-position: 50% 50%;
`
const CardBody = styled.div`
   font-size: 13px;
   line-height: 1.5;
   padding: 0 16px;
   color: #111827;
`
const CardActions = styled.div`
   display: flex;
   gap: 24px;
   font-size: 13px;
   padding: 12px 16px 16px;
   color: #4b5563;
`

const Fab = styled.button`
   position: fixed;
   right: var(--safe-x);
   bottom: var(--safe-x);
   width: 72px;
   height: 72px;
   border-radius: 50%;
   display: grid;
   place-items: center;
   font-size: 40px;
   font-weight: 100; /* 더 얇은 + 표시 */
   color: #e6e8ff;
   background: #6c5ce7;
   border: none;
   box-shadow: 0 8px 20px rgba(108, 92, 231, 0.35);
   z-index: 100;
`
