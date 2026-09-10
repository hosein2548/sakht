"use client";


import {
 useEffect,
 useState,
} from "react";


import {
 WelcomeSlider
} from "./welcome-slider";


import {
 WelcomeActions
} from "./welcome-actions";


import {
 welcomeService
} from "@/src/features/welcome/services/welcome.service";


import type {
 WelcomeSlide
} from "@/src/features/welcome/types/welcome.types";



export function WelcomePage(){


const [
slides,
setSlides
]=useState<WelcomeSlide[]>([]);



useEffect(()=>{


welcomeService
.getSlides()
.then(setSlides);


},[]);



return (

<main
className="
min-h-screen
flex
items-center
justify-center
px-4
py-8
bg-background
"
>


<section

className="
w-full
max-w-xl
flex
flex-col
gap-6
items-center
"

>


<h1
className="
text-2xl
font-bold
text-center
"
>

به سامانه مدیریت ساختمان خوش آمدید

</h1>



<WelcomeSlider

slides={slides}

/>



<WelcomeActions />


</section>


</main>

);


}