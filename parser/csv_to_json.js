// Takes a CSV and relevant columns.
// For example, for `integrated_chinese.csv`, we want to run:
//    node csv_to_json.js -f '../csv/integrated_chinese.csv' -t 'Simplified' \
//      -d 'English' -p 'Pinyin'
'use strict';

var argv = require('optimist')
  .alias('f', 'file')
  .alias('t', 'term')
  .alias('d', 'definition')
  .alias('p', 'pronunciation')
  .alias('s', 'separator')
  .demand(['f'])
  .argv;
var csv = require('csv');
var fs = require('fs');


var TERM_FIELD = argv.term || 'Term';
var DEFN_FIELD = argv.definition || 'Definition';
var PRON_FIELD = argv.pronunciation || 'Pronunciation';

// Always check existence/empty string before using things we get from the
// separator.
var DEFN_SEPARATOR = argv.separator || '/';

var columnFilter = {}
columnFilter[TERM_FIELD] = 'term';
columnFilter[DEFN_FIELD] = 'defn';
columnFilter[PRON_FIELD] = 'pron';

csv()
  .from.path(argv.file, {comment: '#', columns: true})
  .to(function(data) {
    csv().from.string(data, {columns: true}).to.array(processFilteredData);
  }, {columns: columnFilter, header: true});



function processFilteredData(data) {
  data = splitDefns(data);

  writeJSON(data)
}

function splitDefns(data) {
  var splitData = [];
  // TODO: remove leading 'to's, since those typically signify verbs.
  for (var i = 0, ii = data.length; i < ii; i += 1) {
    var entry = data[i];
    var definitions = entry.defn.split(DEFN_SEPARATOR);
    for (var j = 0, jj = definitions.length; j < jj; j += 1) {
      var def = definitions[j];
      if (def) {
        splitData.push({
          defn: def,
          term: entry.term,
          pron: entry.pron
        });
      }
    }
  }
  return splitData;
}

function writeJSON(data) {
  fs.writeFileSync(argv.file + '.json', JSON.stringify(data));
}
