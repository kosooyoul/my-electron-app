const axios = require("axios");

const getWiseSaying = async () => {
  return await axios.get("http://www.ahyane.net/backend/wisesaying.php", {
    responseType: "json"
  });
};

module.exports = {
  getWiseSaying: getWiseSaying
};