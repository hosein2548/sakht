"use client";


import Image from "next/image";

import {
  useEffect,
  useState,
} from "react";

import type {
  WelcomeSlide,
} from "@/src/features/welcome/types/welcome.types";


interface Props {
  slides: WelcomeSlide[];
}



export function WelcomeSlider({
  slides
}: Props) {


  const [index,setIndex] =
    useState(0);



  useEffect(()=>{


    if(!slides.length)
      return;


    const timer =
      setInterval(()=>{

        setIndex(
          current =>
          current === slides.length - 1
          ? 0
          : current + 1
        );

      },4000);


    return ()=>clearInterval(timer);


  },[slides]);



  if(!slides.length)
    return null;



  return (

    <div
      className="
      relative
      w-full
      aspect-video
      overflow-hidden
      rounded-xl
      "
    >


      <Image

        src={
          slides[index].image
        }

        alt="welcome"

        fill

        className="
        object-cover
        "

      />



      <div
        className="
        absolute
        bottom-3
        left-0
        right-0
        flex
        justify-center
        gap-2
        "
      >

      {
        slides.map(
          (item,i)=>(

          <span

          key={item.id}

          className={`
          h-2
          w-2
          rounded-full

          ${
            i===index
            ?
            "bg-primary"
            :
            "bg-muted"
          }

          `}
          />

        ))
      }

      </div>


    </div>

  );

}