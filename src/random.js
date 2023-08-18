// Module to generate random ids

// Declare all characters
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateString(length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    let index = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(index % charactersLength);
  }

  return result;
}
