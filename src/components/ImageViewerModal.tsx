'use client'

import React from 'react'
import styled from 'styled-components'

interface ImageViewerModalProps {
   isOpen: boolean
   imageUrl: string
   onClose: () => void
}

export default function ImageViewerModal({ isOpen, imageUrl, onClose }: ImageViewerModalProps) {
   if (!isOpen || !imageUrl) return null

   return (
      <Overlay onClick={onClose}>
         <ImageContainer onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={onClose}>&times;</CloseButton>
            <Image src={imageUrl} alt="확대된 이미지" />
         </ImageContainer>
      </Overlay>
   )
}

const Overlay = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: rgba(0, 0, 0, 0.9);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 2000;
   cursor: pointer;
`

const ImageContainer = styled.div`
   position: relative;
   max-width: 90vw;
   max-height: 90vh;
   cursor: default;
`

const CloseButton = styled.button`
   position: absolute;
   top: -40px;
   right: 0;
   background: none;
   border: none;
   color: white;
   font-size: 32px;
   cursor: pointer;
   padding: 8px;
   line-height: 1;

   &:hover {
      color: #ccc;
   }
`

const Image = styled.img`
   max-width: 90vw;
   max-height: 90vh;
   object-fit: contain;
   border-radius: 8px;
`
