var START = '<span class="__bookish-card">';
var END = '</span>';

var $scrollDiv = $('#globalContainer');
var cachedHeight = $scrollDiv.height();

function findContent() {
  if ($scrollDiv.height() > cachedHeight) {
    cachedHeight = $scrollDiv.height();

    $('.userContent').each(function() {
      var $userContent = $(this);
      var newText = $userContent.text().replace(/tough/gi, START + '一点' + END);
      $userContent.html(newText);
    });
  }

  setTimeout(findContent, 1000);
}

findContent();
