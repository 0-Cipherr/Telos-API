const encoder = new TextEncoder();

export function encodeValues(params: any) {
  try {
    const encodedValue = encoder.encode(...params);
    return encodedValue;
  } catch (error) {
    console.log(error);
    return encoder.encode("");
  }
}
