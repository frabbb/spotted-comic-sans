type EntryType = "post" | "page";

type EntryTypes = "posts" | "pages";

type TextTheme = {
  size?: "s" | "m" | "l";
  variant?: "black" | "white";
};

type CtaTheme = {
  type?: "link" | "button";
  variant?: "underline" | "primary";
  color?: "black" | "white";
  size?: "s" | "m" | "l";
};

type MediaTheme = {
  type?: "grid" | "carousel";
  variant?: "inline" | "large" | "cols3";
};

type SliderTheme = "default" | "media" | "stack" | "loop";

type ImageTheme = "fill" | "fit" | "skeleton";

type VideoTheme = {
  variant?: "fill";
  color?: "black" | "white";
};

type BillboardTheme = "default" | "small";

type StackTheme = {
  type?: "grid" | "carousel";
  variant?: "default" | "compact";
};

type ArchiveTheme = "default" | "compact";

type ThumbTheme = "stack" | "archive";

type ColumnsTheme = "default" | "compact";

type LinksTheme = "horizontal" | "vertical" | "menu";

type EmbedTheme = "default";

type IconName = "cross" | "arrow" | "plus" | "minus";

type VideoProperties = {
  playing: boolean;
  progress: number;
  duration: number;
  muted: boolean;
  fullscreen: boolean;
  hasPlayed: boolean;
  resolution: { w: number; h: number };
};
