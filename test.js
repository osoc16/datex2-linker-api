import test from 'ava';
import http from 'http';
import * as jsonld from 'jsonld';
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

test('it\'s possible to flatten the served json', async t => {
  const server = http.createServer(function(req, res) {
    res.end(`
<?xml version="1.0" encoding="UTF-8"?>
<d2LogicaModel xmlns="http://datex2.eu/schema/2/2_0">
   <exchange>
      <supplierIdentification>
         <country>fi</country>
         <nationalIdentifier>Finnpark</nationalIdentifier>
      </supplierIdentification>
   </exchange>
   <payloadPublication xsi:type="GenericPublication" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <publicationTime>2016-07-19T18:51:12+03:00</publicationTime>
      <publicationCreator>
         <country>fi</country>
         <nationalIdentifier>Finnpark</nationalIdentifier>
      </publicationCreator>
      <genericPublicationName>Finland Parking Facilities</genericPublicationName>
      <genericPublicationExtension>
         <parkingFacilityTablePublication>
            <headerInformation>
               <areaOfInterest>national</areaOfInterest>
               <confidentiality>noRestriction</confidentiality>
               <informationStatus>real</informationStatus>
            </headerInformation>
            <parkingFacilityTable>
               <parkingFacilityTableName>Finnpark</parkingFacilityTableName>
               <parkingFacilityTableVersionTime>2015-03-05</parkingFacilityTableVersionTime>
               <parkingFacility id="FNPK.11" version="1.0">
                  <parkingFacilityName>P-Plevna</parkingFacilityName>
                  <parkingFacilityRecordVersionTime>2015-03-05</parkingFacilityRecordVersionTime>
                  <carParkDetails>
                     <tag>Address</tag>
                     <value>Polttimokatu 5, 33210, Tampere</value>
                  </carParkDetails>
                  <entranceLocation>
                     <pointByCoordinates>
                        <pointCoordinates>
                           <latitude>61.501653</latitude>
                           <longitude>23.757688</longitude>
                        </pointCoordinates>
                     </pointByCoordinates>
                  </entranceLocation>
               </parkingFacility>
            </parkingFacilityTable>
         </parkingFacilityTablePublication>
         <parkingFacilityTableStatusPublication>
            <headerInformation>
               <areaOfInterest>national</areaOfInterest>
               <confidentiality>noRestriction</confidentiality>
               <informationStatus>real</informationStatus>
            </headerInformation>
            <parkingFacilityStatus>
               <parkingFacilityOccupancyTrend>stable</parkingFacilityOccupancyTrend>
               <parkingFacilityReference id="FNPK.11" version="1.0" targetClass="ParkingFacility"/>
               <parkingFacilityStatus>spacesAvailable</parkingFacilityStatus>
               <parkingFacilityStatus>open</parkingFacilityStatus>
               <parkingFacilityStatusTime>2016-07-19T18:51:11+03:00</parkingFacilityStatusTime>
            </parkingFacilityStatus>
         </parkingFacilityTableStatusPublication>
      </genericPublicationExtension>
   </payloadPublication>
</d2LogicaModel>`);
  });
  server.listen('4004');

  const json = await parse('http://localhost:4004', 'http://test.dev/datex/');
  t.notThrows(jsonld.promises.flatten(json));
});
