/**
 * Basic Material Class
 */
const Color = require('lib/Color');
const DEFAULT_PROPERTIES = {
  color: new Color (0xffffff),
  specularity: .2
}
class Material {
  constructor (properties) {
    properties = properties || {};
    this.color = properties.color || DEFAULT_PROPERTIES.color;
    this.specularity = !isNaN(properties.specularity) ? properties.specularity : DEFAULT_PROPERTIES.specularity;
  }
}

module.exports = Material;
