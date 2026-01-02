import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { sanityData } from "@/utils/maps/sanity";
import { formieData } from "@/utils/maps/forms/formie";

export const parsedData = (raw: any, type: string) => sanityData(raw, type);
export const parsedForm = (raw: any) => formieData(raw);

export const isSSR = () => typeof window === "undefined";

export const isPreview = (query: any) => {
  const previewKeys = new Map([
    ["craft", "x-craft-live-preview"],
    ["sanity", "preview"],
  ]);
  return "x-craft-live-preview" in query && "token" in query;
};

export const extractNumber = (str: string) => {
  var num = str.replace(/[^0-9]/g, "");
  return parseInt(num, 10);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const tw = <T extends TemplateStringsArray | string>(tailwindClasses: T) => tailwindClasses;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function map(
  value: number,
  min: number,
  max: number,
  minOut: number,
  maxOut: number,
  constrain: boolean = true,
) {
  const result = ((value - min) / (max - min)) * (maxOut - minOut) + minOut;
  return constrain ? clamp(result, minOut, maxOut) : result;
}
