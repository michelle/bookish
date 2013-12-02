function save_options() {
  if ($('#fluent_mode').is(':checked')) {
    localStorage && localStorage.setItem('fluent_mode', 'checked');
  } else {
    localStorage && localStorage.removeItem('fluent_mode');
  }
}

function restore_options() {
  $('#fluent_mode').attr('checked', localStorage['fluent_mode']);
};

$(restore_options);
$('#save_button').on('click', save_options);
