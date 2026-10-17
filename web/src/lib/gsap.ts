"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin, CustomEase, useGSAP);
  CustomEase.create("expo", "0.16, 1, 0.3, 1");
  CustomEase.create("inOut", "0.76, 0, 0.24, 1");
  gsap.defaults({ ease: "expo", duration: 1 });
}

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const DESKTOP = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
