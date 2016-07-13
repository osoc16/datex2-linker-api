# Datex2 linker API

This is the API used in [datex2-linker](https://github.com/osoc16/datex2-linker).

# Usage

```js
import parse from 'datex2-linker-api';

/**
 * Parse a xml datex2 feed into a json-ld feed
 * @param  {string} source  a valid URL that goes to an xml datex2 feed
 * @param  {string} baseuri the baseuri that contains each identifier (as a hash)
 * @return {Promise}        will return the json-ld once parsing has completed
 */
parse(source, baseuri).then(res=>{
  console.log(res); // an object with the same value as the original xml
}).catch(err=>{
  console.error(err); // 'error while parsing xml. ...'
});
```

# License

© 2016 - Open Knowledge Belgium - iMinds — Haroen Viaene and [contributors](https://github.com/oSoc16/datex2-linker-api/graphs/contributors)

Licensed under the Apache 2.0 license.
