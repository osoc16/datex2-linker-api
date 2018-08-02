const got = require('got');
const xml2js = require('xml2js');

/**
 * The json-ld context used for all of the terms
 * todo: make sure that every possible term is available here
 * report to https://github.com/OpenTransport/linked-datex2
 * @type {Object}
 */
const context = {
  '@vocab': 'http://vocab.datex.org/terms#'
};

/**
 * Parse a xml datex2 feed into a json-ld feed
 * @param  {string} source  a valid URL that goes to an xml datex2 feed
 * @param  {string} baseuri the baseuri that contains each identifier (as a hash)
 * @param  {[object]} sourceOptions any of the `http.request` options.
 * @return {Promise}        will return the json-ld once parsing has completed
 */
function parse(source, baseuri, sourceOptions) {
  return new Promise((resolve, reject) => {
    // Get the requested source datafeed
    got(source, sourceOptions).then(response => {
      // Options for parsing the xml
      const parser = new xml2js.Parser({
        mergeAttrs: true,
        explicitArray: false,
        tagNameProcessors: [xml2js.processors.stripPrefix],
        attrNameProcessors: [xml2js.processors.stripPrefix],
        attrValueProcessors: [xml2js.processors.stripPrefix]
      });

      // Parse the body of the request as xml to json with options
      parser.parseString(response.body, (err, result) => {
        if (err) {
          reject(new Error(`error while parsing xml.\n ${JSON.stringify(err)}`));
        }

        const data = addLinksToIds(result, baseuri);

        resolve({
          '@context': context,
          '@graph': data
        });
      });
    }).catch(err => {
      reject(new Error(`error while getting source file.\n ${err}`));
    });
  });
}

/**
 * Change id's into @id with uri
 * @param  {object} json  the json that needs to be transformed
 * @param  {string} base  url that has terms as a hash
 * @return {object}       the transformed object
 */
function addLinksToIds(json, base) {
  function recurse(out) {
    for (const inner in out) {
      if (Object.prototype.hasOwnProperty.call(out, inner)) {
        // If the current child contains more nesting, we need to continue
        if (typeof out[inner] === 'object') {
          recurse(out[inner]);
        }
        // If the current key is `id`, we need to transform it
        if (inner === 'id') {
          // Make a new `@id` child that links to this identifier
          out['@id'] = base + '#' + out[inner];
          // Remove the original `id` child
          out[inner] = undefined;
        }
      }
    }
  }
  recurse(json);
  return json;
}

module.exports = parse;
