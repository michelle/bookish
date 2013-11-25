var START = '<span class="__bookish-card" data-original="';
var MIDDLE = '">';
var END = '</span>';

var $scrollDiv = $('#globalContainer');
var cachedHeight = $scrollDiv.height();

function findContent() {
  if ($scrollDiv.height() > cachedHeight) {
    var wordCount = 0;
    cachedHeight = $scrollDiv.height();

    // TODO: these should be filled in dynamically.
    var defn = 'you';
    var word = '一点';

    // Preprocessing step.
    var terms = [];
    // TODO: actually preprocess dynamically.
    terms[0] = {
      re0: new RegExp('\\b' + defn + '\\b', 'gi'),
      re1: new RegExp('\\b' + word + '\\b', 'gi'),
      repl: START + defn + MIDDLE + word + END
    };

    // We can't avoid going over all of them again, unfortunately, because FB
    // forces a redraw of statuses, stripping the HTML.
    $('.userContent').each(function() {

      var $userContent = $(this);
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

$scrollDiv.on('mouseenter', '.__bookish-card', function() {
  showOriginal.call(this);
});
$scrollDiv.on('touchstart', '.__bookish-card', function() {
  showOriginal.call(this);
});

$scrollDiv.on('mouseleave', '.__bookish-card', function() {
  showTerm.call(this);
});
$scrollDiv.on('touchend', '.__bookish-card', function() {
  showTerm.call(this);
});


function showOriginal() {
  $card = $(this);
  if (!$card.data('term')) {
    $card.data('term', $card.text());
  }
  $card.text($card.data('original'));
}

function showTerm() {
  $card = $(this);
  $card.text($card.data('term'));
}

findContent();
