const citiesData = require('./cities');
const heritagesData = require('./heritages');

module.exports = {
  ...citiesData,
  ...heritagesData
};
