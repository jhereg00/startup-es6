/**
 * clamp function
 *
 * @param {number} baseNumber
 * @param {number} min
 * @param {number} max
 *
 * @returns {number}
 */
let clamp = function (baseNumber, min, max) {
	return Math.min(max, Math.max(baseNumber, min));
};

module.exports = clamp;
