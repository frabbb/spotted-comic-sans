import { defineFormKitConfig } from "@formkit/vue";
import Arrow from "@/assets/svg/icons/arrow.svg?raw";
import Cross from "@/assets/svg/icons/cross.svg?raw";
import Eye from "@/assets/svg/icons/eye.svg?raw";
import Minus from "@/assets/svg/icons/minus.svg?raw";
import Plus from "@/assets/svg/icons/plus.svg?raw";
import Square from "@/assets/svg/icons/square.svg?raw";
import Triangle from "@/assets/svg/icons/triangle.svg?raw";
import Checkbox from "@/assets/svg/icons/checkbox.svg?raw";
import Radio from "@/assets/svg/icons/radio.svg?raw";

function generateClasses(classes) {
  const classesBySectionKey = {};
  Object.keys(classes).forEach((type) => {
    Object.keys(classes[type]).forEach((sectionKey) => {
      if (!classesBySectionKey[sectionKey]) {
        classesBySectionKey[sectionKey] = {
          [type]: classes[type][sectionKey],
        };
      } else {
        classesBySectionKey[sectionKey][type] = classes[type][sectionKey];
      }
    });
  });

  Object.keys(classesBySectionKey).forEach((sectionKey) => {
    const classesObject = classesBySectionKey[sectionKey];
    classesBySectionKey[sectionKey] = function (node, sectionKey) {
      return addClassesBySection(node, sectionKey, classesObject);
    };
  });

  return classesBySectionKey;
}

function addClassesBySection(node, _sectionKey, classesByType) {
  const type = node.props.type;
  const family = node.props.family;
  let classList = "";
  if (classesByType.global) {
    classList += classesByType.global + " ";
  }
  if (classesByType[`family:${family}`]) {
    classList += classesByType[`family:${family}`] + " ";
  }
  if (classesByType[type]) {
    classList += classesByType[type];
  }
  const listParts = classList.split("$reset");
  if (listParts.length > 1) {
    return `$reset ${listParts[listParts.length - 1].trim()}`;
  }
  return listParts[0].trim();
}

export default defineFormKitConfig({
  iconLoader: (iconName) => {
    return false;
  },
  config: {
    classes: generateClasses({
      global: {
        outer: "max-w-(--breakpoint-s)",
        fieldset: "",
        help: "typo-xs pt-xs text-grey-500",
        inner:
          "transition-all duration-150 bg-grey-100 rounded-DEFAULT border-grey-500 h-fit hover:bg-grey-300 outline outline-transparent has-[:focus]:outline-grey-500",
        input: "w-full typo-s p-s block focus:outline-none",
        label: "typo-s",
        legend: "typo-s pb-xs",
        loaderIcon: "",
        message: "typo-s pt-s",
        messages: "",
        prefixIcon: "h-icon aspect-square block",
        suffixIcon: "h-icon aspect-square block",
        decoratorIcon: "h-icon aspect-square block",
        selectIcon: "h-icon aspect-square block",
        fileItemIcon: "h-icon aspect-square block",
        fileRemoveIcon: "h-icon aspect-square block",
        noFilesIcon: "h-icon aspect-square block",
        options: "grid gap-xs",
      },
      checkbox: {
        wrapper: "flex gap-xs items-center cursor-pointer w-fit",
        inner: "border-none rounded-none",
        input: "hidden",
      },
      radio: {
        wrapper: "flex w-fit gap-xs items-center cursor-pointer",
        inner: "border-none rounded-full",
        input: "hidden",
        label: "pb-0",
      },
      select: {
        inner: "relative",
        input: "cursor-pointer appearance-none",
        icon: "absolute pointer-events-none right-s top-1/2 -translate-y-1/2 rotate-90",
      },
      number: {
        prefixIcon: "ml-s cursor-pointer",
        suffixIcon: "mr-s cursor-pointer",
        inner: "flex gap-s items-center",
      },
      date: {
        input: "cursor-pointer",
      },
      submit: {
        outer: "bg-black rounded-DEFAULT text-white cursor-pointer hover:bg-grey-900",
        input: "cursor-pointer p-s",
      },
      "family:button": {
        input: "link button",
      },
    }),
  },
  icons: {
    arrow: Arrow,
    cross: Cross,
    eye: Eye,
    minus: Minus,
    plus: Plus,
    square: Square,
    triangle: Triangle,
    checkbox: Checkbox,
    radio: Radio,
  },
});
