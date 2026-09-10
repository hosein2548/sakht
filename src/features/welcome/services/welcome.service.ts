import { welcomeApi } from "../api/welcome.api";

import type {
  WelcomeSlide,
} from "@/src/features/welcome/types/welcome.types";


export const welcomeService = {


  async getSlides(): Promise<WelcomeSlide[]> {

    return await welcomeApi.getSlides();

  }


};