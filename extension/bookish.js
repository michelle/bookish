var END_SPAN = '</span>';

var $scrollDiv = $('#globalContainer');
var cachedHeight = 0;


// TODO: actually import a dictionary from CSV.
// TODO: this should be sorted in order of defn length so phrases take
// precedence over words.
var dictionary = {
  'you': '你',
  'have': '有',
  'time': '时间'
};
var terms = [];


function preprocess() {
  // Preprocessing step.
  var definitions = Object.keys(dictionary);

  for (var i = 0, ii = definitions.length; i < ii; i += 1) {
    var defn = definitions[i];
    var word = dictionary[defn];

    terms.push({
      re0: new RegExp('\\b' + defn + '\\b', 'gi'),
      re1: new RegExp('\\b' + word + '\\b', 'gi'),
      repl: generateReplacement(defn, word)
    });
  }
}

function generateSpan(className) {
  className = className || '';
  return '<span class="' + className + '">';
}

function generateReplacement(defn, word) {
  var replacement = generateSpan('__bookish-card');

  replacement += generateSpan('b-word');
  replacement += word;
  replacement += END_SPAN;

  // Hide definition at first.
  replacement += generateSpan('b-defn b-hidden');
  replacement += defn;
  replacement += END_SPAN;

  replacement += END_SPAN;
  return replacement;
}


function findContent() {
  if ($scrollDiv.height() !== cachedHeight) {
    var wordCount = 0;
    cachedHeight = $scrollDiv.height();

    // We can't avoid going over all of them again, unfortunately, because FB
    // forces a redraw of statuses, stripping the HTML.
    $('.userContent').each(function() {

      var $userContent = $(this);

      // Avoid redrawing statuses that've already been processed.
      if ($userContent.find('.__bookish-card').length) {
        return;
      }

      var text = $userContent.text();
      var newText = text;

      for (var i = 0, ii = terms.length; i < ii; i += 1) {
        var term = terms[i];
        newText = newText.replace(term.re0, term.repl);
        newText = newText.replace(term.re1, term.repl);
      }

      if (newText !== text) {
        $userContent.html(newText);
      }

    });
  }

  setTimeout(findContent, 1000);
}

$scrollDiv.on('click', '.__bookish-card', function() {
  toggleTerm.call(this);
});


function toggleTerm() {
  $card = $(this);
  $card.find('.b-defn').toggleClass('b-hidden');
  $card.find('.b-word').toggleClass('b-hidden');
}

preprocess();
findContent();
