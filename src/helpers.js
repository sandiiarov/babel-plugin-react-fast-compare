const isPrimitive = val => val == null || /^[sbn]/.test(typeof val);

export const looksLike = (a, b) =>
  a &&
  b &&
  Object.keys(b).every(bKey => {
    const bVal = b[bKey];
    const aVal = a[bKey];
    if (typeof bVal === "function") {
      return bVal(aVal);
    }
    return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal);
  });
