export const generateRandomString = async() =>
    Math.random()
    .toString(36)
    .substring(2);
