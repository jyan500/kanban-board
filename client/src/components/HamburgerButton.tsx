import React from 'react'
import { useAppDispatch } from "../hooks/redux-hooks"
import { toggleSideBar } from "../slices/navSlice" 
import "../styles/hamburger.css"

export const HamburgerButton = () => {
    const dispatch = useAppDispatch() 
    return (
        <button onClick={() => dispatch(toggleSideBar(true))} className="dark:tw-text-white hamburger --transparent">
            <svg className="--l-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier"> 
                    <path d="M4 18L20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="tw-stroke-black dark:tw-stroke-white"></path> 
                    <path d="M4 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="tw-stroke-black dark:tw-stroke-white"></path> 
                    <path d="M4 6L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="tw-stroke-black dark:tw-stroke-white"></path> 
                </g>
            </svg>
        </button>
    )
}
