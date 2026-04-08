function replaceTemplatePlaceholders(template, data) {
  let html = template;

  Object.keys(data).forEach((key) => {
    const value = data[key] ?? "";
    html = html.replaceAll(`{{${key}}}`, String(value));
  });

  return html;
}

module.exports = replaceTemplatePlaceholders;