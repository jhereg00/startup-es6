/**
 * extendObject function
 *
 * extend one object with another object's property's (default is deep extend)
 * this works with circular references and is faster than other deep extend methods
 * http://jsperf.com/comparing-custom-deep-extend-to-jquery-deep-extend/2
 *
 * based on this gist: https://gist.github.com/fshost/4146993
 *
 * @param {object} target - object that gets extended
 * @param {object} source - object with values to add to / override target's
 * @param {boolean, optional} shallow - if true, won't extend child objects if defined in target. Default: false
 *
 * @returns {object} extendedTarget
 */
let array = '[object Array]',
    object = '[object Object]',
    targetMeta,
    sourceMeta;

function setMeta (value) {
  // checks what type of value we have, array, object, or other
  let jclass = {}.toString.call(value);
  if (value === undefined) return 0;
  else if (typeof value !== 'object') return false;
  else if (jclass === array) return 1;
  else if (jclass === object) return 2;
};

function extendObject () {
  // parse from arguments
  let target = arguments[0];
  let shallow = arguments[arguments.length - 1] === true;
  for (let i = 1; i < arguments.length; i++) {
    let source = arguments[i];
    if (!source || (typeof source !== 'object' && typeof source !== 'function'))
      continue;
    for (let key in source) {
      // iterate through props in source object
      if (source.hasOwnProperty(key)) {
        targetMeta = setMeta(target[key]);
        sourceMeta = setMeta(source[key]);
        if (source[key] !== target[key]) {
          // not the same, better update target
          if (sourceMeta === 1) {
            target[key] = Array.prototype.slice.apply(source[key],[0]);
          }
          else if (!shallow && sourceMeta && targetMeta && targetMeta === sourceMeta) {
            // deep extend if of same type
            let newVal = {};
            target[key] = extendObject(newVal, target[key], source[key], false);
          } else if (sourceMeta !== 0) {
            // shallow, or just set to source's prop
            target[key] = source[key];
          }
        }
      }
      else break; // hasOwnProperty === false, meaning we're through the non-prototype stuff
    }
  }
  return target;
}

module.exports = extendObject;
