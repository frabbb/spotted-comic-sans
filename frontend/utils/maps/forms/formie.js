export const formieData = (raw) => {
  const groups = [];
  let i = 0;
  let previous;

  raw.rows.forEach((r, index) => {
    const firstField = r.fields[0];
    if (parsedType(firstField) !== "group") {
      if (previous === "group") {
        i += 1;
      }

      groups[i] = { rows: [...(groups[i]?.rows || []), r.fields.map((f) => parsedField(f))] };

      previous = "field";
    } else {
      if (index > 0) {
        i += 1;
      }
      groups[i] = parsedField(firstField);
      previous = "group";
    }
  });

  return {
    pages: [{ groups }],
    message: raw.settings.submitActionMessageHtml,
    submitLabel: raw.pages[0].settings.submitButtonLabel,
  };
};

const parsedType = (raw) => {
  const type = raw.displayName;

  switch (type) {
    case "SingleLineText":
      return "text";
    case "MultiLineText":
      return "textarea";
    case "Checkboxes":
      return "checkbox";
    case "Dropdown":
      return "select";
    case "Phone":
      return "tel";
    case "FileUpload":
      return "file";
    case "Date":
      const handles = raw.fields?.map((f) => f.handle) || [];
      if (handles.includes("date") && handles.includes("time")) {
        return "datetime-local";
      } else if (handles.includes("date")) {
        return "date";
      } else if (handles.includes("time")) {
        return "time";
      }
      return "date";

    default:
      return type.toLowerCase();
  }
};

const parsedField = (raw) => {
  const extensions = new Map([
    ["image", ".jpg,.jpeg,.png,.gif,.webp"],
    ["pdf", ".pdf"],
  ]);

  const hideLabel = raw.labelPosition?.includes("Hidden");

  const type = parsedType(raw);

  const input = {
    id: raw.id,
    name: raw.matchField ? `${raw.matchField.slice(1, -1)}_confirm` : raw.handle,
    label: !hideLabel ? `${raw.label}${raw.required ? " *" : ""}` : null,
    value:
      raw.defaultValue || raw.defaultDate || raw.htmlContent || (type === "number" ? "0" : null),
    placeholder: raw.placeholder,
    help: raw.instructions,
    type,
    validation: [
      [type],
      ...(raw.required ? [["required"]] : []),
      ...(type === "tel" ? [["matches", /^[0-9]{9,10}$/]] : []),
      ...(type === "password" && raw.matchField ? [["confirm"]] : []),
    ],
    minlength: raw.min,
    maxlength: raw.max,
    min: raw.minValue || raw.minDate?.slice(0, 10),
    max: raw.maxValue || raw.maxDate?.slice(0, 10),
    multiple: raw.multi || parseInt(raw.limitFiles || 0) > 1,
    accept: raw.allowedKinds?.reduce((r, v) => `${extensions.get(v)},${r}`, ""),
  };

  if (type === "group") {
    return {
      ...input,
      label: !hideLabel ? raw.label : null,
      rows: raw.rows.map((r) => r.fields.map((f) => parsedField(f))),
    };
  } else {
    if (type === "select" || type === "checkbox" || type === "radio") {
      const options = raw.options.map((c) => ({
        label: c.label,
        value: c.value,
        attrs: { disabled: false },
      }));
      const selected = raw.options.filter((c) => c.isDefault).map((c) => c.value);
      input.options = options;
      input.value = selected.length ? selected : null;
    }

    return input;
  }
};
