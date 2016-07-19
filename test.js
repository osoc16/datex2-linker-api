import test from 'ava';
import http from 'http';
import parse from './index.js';

test('served xml is converted to json', async t => {
  const server = http.createServer(function(req, res) {
    res.end(`
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<string someremovednamespace:attribute="value">
  <text>content</text>
</string>`);
  });
  server.listen('4002');
  const json = JSON.stringify(await parse('http://localhost:4002'));
  t.is(json, '{"@context":{"@vocab":"http://vocab.datex.org/terms#"},"@graph":{"string":{"attribute":"value","text":"content"}}}');
});

test('served xml converts id to @id', async t => {
  const server = http.createServer(function(req, res) {
    res.end(`
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<d2LogicalModel xmlns="http://datex2.eu/schema/2/2_0" modelBaseVersion="2" id="azertyuiop">
</d2LogicalModel>`);
  });
  server.listen('4003');
  const json = JSON.stringify(await parse('http://localhost:4003', 'http://test.dev/datex/'));
  t.is(json, '{"@context":{"@vocab":"http://vocab.datex.org/terms#"},"@graph":{"d2LogicalModel":{"xmlns":"//datex2.eu/schema/2/2_0","modelBaseVersion":"2","@id":"http://test.dev/datex/#azertyuiop"}}}');
});
