export default (
  space: "default" | "s" | "m" | "l" | "xl" | "2xl",
  type: string,
  next?: string,
  margin: boolean = false,
) => {
  const pbClasses = new Map([
    ["0", "pb-0"],
    ["s", "pb-s"],
    ["m", "pb-m"],
    ["l", "pb-l"],
    ["xl", "pb-xl"],
    ["2xl", "pb-2xl"],
  ]);

  const mbClasses = new Map([
    ["0", "mb-0"],
    ["s", "mb-s"],
    ["m", "mb-m"],
    ["l", "mb-l"],
    ["xl", "mb-xl"],
    ["2xl", "mb-2xl"],
  ]);

  let value: string = "pb-2xl";

  if (space === "default") {
    switch (type) {
      case "section":
        value = "pb-3xl";
        break;

      case "heading":
        value = "pb-s";
        break;

      case "media":
        value = "pb-2xl";
        break;
    }
  } else {
    value = (margin ? mbClasses.get(space) : pbClasses.get(space)) || "pb-m";
  }

  if (!next && type !== "section") {
    value = "pb-0";
  }

  return value;
};
