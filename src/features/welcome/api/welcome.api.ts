import { apiClient } from "@/src/core/api/client";

import type {
  WelcomeSlide,
} from "@/src/features/welcome/types/welcome.types";


export const welcomeApi = {


  async getSlides(): Promise<WelcomeSlide[]> {


    /*
      فعلا مطابق Flutter
      بعدا اگر API شد فقط اینجا تغییر می‌کند
    */


    return [
      {
        id:1,
        image:
        "http://web120.ir/apartment/picperesent/1.png",
      },
      {
        id:2,
        image:
        "http://web120.ir/apartment/picperesent/2.png",
      },
      {
        id:3,
        image:
        "http://web120.ir/apartment/picperesent/3.png",
      },
      {
        id:4,
        image:
        "http://web120.ir/apartment/picperesent/4.png",
      },
      {
        id:5,
        image:
        "http://web120.ir/apartment/picperesent/5.png",
      },
      {
        id:6,
        image:
        "http://web120.ir/apartment/picperesent/6.png",
      },
      {
        id:7,
        image:
        "http://web120.ir/apartment/picperesent/7.png",
      },
      {
        id:8,
        image:
        "http://web120.ir/apartment/picperesent/8.png",
      },
    ];

  }

};