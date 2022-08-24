const buildUrlParams = (object) => {
  const parts = [];

  Object.keys(object).forEach((objectKey) => {
    if (Array.isArray(object[objectKey])) {
      object[objectKey].forEach((arrayItem) => {
        parts.push(`${objectKey}[]=${arrayItem}`);
      });
    } else if (typeof object[objectKey] === 'object' && object[objectKey] !== null) {
      Object.keys(object[objectKey]).forEach((item) => {
        if (Array.isArray(object[objectKey][item])) {
          object[objectKey][item].forEach((i) => {
            parts.push(`${objectKey}[${item}][]=${i}`);
          });
        } else if (object[objectKey][item] !== null) {
          parts.push(`${objectKey}[${item}]=${object[objectKey][item]}`);
        }
      });
    } else if (object[objectKey] === null) {
      // do something
    } else {
      parts.push(`key=${object[objectKey]}`);
    }
  });

  return parts.join('&');
};

export default buildUrlParams;
