// edit buttons
$('#edit1').click((e)=>{
  e.preventDefault();
  window.location.href = '/form/newRide/1';
});

$('#edit2').click((e)=>{
  e.preventDefault();
  window.location.href = '/form/newRide/2';
});

// second step submit
$('.submit').click((e)=>{
  e.preventDefault();
  $('#carId').attr('value',e.target.id);
  $('#selectCarForm').submit();
});

// Book another trip action
$('#book').click((e)=>{
  e.preventDefault();
  window.location.href = '/form/newRide/1';
});
