// clicking ride to list details
$('.edit_ride').click((e)=>{
  e.preventDefault();
  let idString = $(e.target).attr('id');
  let arr = idString.split('_');
  let id = arr[1];
  window.location.href = '/admin/list/' + id;
});

$('.delete_ride').click((e)=>{
  e.preventDefault();
  let idString = $(e.target).attr('id');
  let arr = idString.split('_');
  let id = arr[1];
  $.ajax({
    type : 'GET',
    url : `/admin/ride/delete/${id}`,
  });
  window.location.href = '/admin/dashboard';
});

// editing payment Details
$('.cost').on('input',()=>{
  let perMile = parseFloat($('#costPerMile').val());
  let vehicleFee = parseFloat($('#costVehicleFee').val());
  let discount = parseFloat($('#discount').val());
  let stops = parseFloat($('#stopCharge').val());
  let child = parseFloat($('#childCharge').val());
  let early = parseFloat($('#earlyCharge').val());
  let totalCost = perMile + vehicleFee + stops + child + early - discount;
  $('#totalCost').val(totalCost);
});

$('.carCost,#distance').on('input',()=>{
  console.log('input');
  let distance = parseFloat($('#distance').val());
  let perMile = parseFloat($('#perMile').val());
  let vehicleFee = parseFloat($('#vehicleFee').val());
  $('#costPerMile').val(perMile*distance);
  $('#costVehicleFee').val(vehicleFee);
  perMile = parseFloat($('#costPerMile').val());
  let discount = parseFloat($('#discount').val());
  let others = parseFloat($('#others').val());
  let totalCost = perMile + vehicleFee + others - discount;
  $('#totalCost').val(totalCost);

});

// upload image preview
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      $('#preview').attr('src', e.target.result);
      $('#preview').attr('width', '40%');
      $('#filename').text(input.files[0].name);
    }
    reader.readAsDataURL(input.files[0]);
  }
}

$("#imageUpload").change(function() {
  readURL(this);
});

// edit cars in admin panel
$('.editCar').click((e)=>{
  e.preventDefault();
  let id = $(e.target).attr('id');
  window.location.href = '/cars/edit/' + id;
});

// edit driver in admin panel
$('.editDriver').click((e)=>{
  e.preventDefault();
  let id = $(e.target).parent().attr('id');
  window.location.href = '/drivers/edit/' + id;
});

// Click add promo
$('#addPromo').click(function(e){

  e.preventDefault();

  let names = $('.promoRecord').text();
  let valueInput = $('#value').val();
  let codeInput = $('#code').val();

  let isDublicate = names.includes(codeInput)

  if (valueInput && codeInput && !isDublicate){
    $.ajax({
      type : 'GET',
      url : `/promos/add/${codeInput}/${valueInput}`,
      success : function (data) {
        let promoRecord = `
        <tr  id="promo_${data.id}">
          <th class="promoRecord" scope="row">${data.code}</th>
          <td>${data.value}</td>
          <td class="text-success">${data.numberUsed}</td>
          <td><button id="${data.id}" class="btn btn-danger delete_promo">Delete</button></td>
        </tr>
        `;
        $('#promoTable').append(promoRecord);
        $('#errMsg').remove();
      }
    });

  } else {
    let duplicateMsg = `
      <div id="errMsg" class="text-danger">
        <small>This promo code already exists OR You forget to fill all inputs !</small>
      </div>
    `;
    $(duplicateMsg).insertAfter('#promoForm');
  }

});

// delete promo
$('.delete_promo').click((e)=>{
  e.preventDefault();
  let id = $(e.target).attr('id');
  console.log(id);
  console.log('ere');
  $.ajax({
    type : 'GET',
    url : `/promos/delete/${id}`,
  });
  $('#promo_'+id).remove();
});

// confirm password
$('#passwordConfirm').on('input',(e)=>{
  let password = $('#password').val();
  let confirm = $('#passwordConfirm').val();

  if (password == confirm) {
    $('#updateCredential').prop('disabled',false);
    $('#confirmComment').removeClass('text-danger');
    $('#confirmComment').addClass('text-success');
    $('#confirmComment').text('* the two passwords match correctly')
  } else {
    $('#updateCredential').prop('disabled',true);
    $('#confirmComment').addClass('text-danger');
    $('#confirmComment').removeClass('text-success');
    $('#confirmComment').text('* there is no match between passwords')
  }
});

// save without sending Email
$('.save_btn').click((e)=>{
  e.preventDefault();
  $('#sendFlag').val("");
  $('#saveRideForm').submit();
});
