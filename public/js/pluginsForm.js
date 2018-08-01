// datepicker
$( function() {
  $( "#pDate" ).datepicker();
} );

// timepicker
$(document).ready(function(){
  $(".time_element").timepicki();
});

// popover
$('#HandiCapInfo').click(function () {
  $('[data-toggle="popover"]').popover('toggle');
});
$(document).ready(function(){
  $('[data-toggle="popover"]').popover();
});

// promoCode validation
$('#promoCode').on('input',function () {
  let code = $('#promoCode').val();
  if (code.length == 5) {
    $.ajax({
      type : 'GET',
      url : `/promos/check/${code}`,
      success : function (data) {
        if (data.isFound) {
          $('#promoStatus').html(`
            valid (${data.value}$)
            <input id="discount" name="discount" type="text" name="" value="${data.value}" hidden>
            `).addClass('text-success');
          let cost = parseInt($('#rideCost').text()) - parseInt(data.value);
          $('#rideCost').text(cost);
          $('#promoCode').prop('readonly',true);
          $('#finalCost').val(cost);
        } else {
          $('#promoStatus').text('invalid').removeClass('text-success');
        }
      }
    });
  } else {
    $('#promoStatus').text('invalid').removeClass('text-success');
  }

});

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
  $('#model').val(e.target.id);
  $('#selectCarForm').submit();
});

// Book another trip action
$('#book').click((e)=>{
  e.preventDefault();
  window.location.href = '/form/newRide/1';
});

// Book return service
$('#returnService').click((e)=>{
  e.preventDefault();
  window.location.href = '/form/returnRide/1';
});

// add Child seat button
let childNo = 1;
$('#addChild').click((e)=>{
  e.preventDefault();
  let html_childSeat = `
    <div id="child_${childNo}" class="form-row text-center">
      <div class="col-md-3 offset-md-4 mb-3">
        <select id="childSeatType" name="childSeatType" class="form-control">
          <option active value="Infant">Infant (ages 0-1)</option>
          <option value="ToddlerSeat">Toddler Seat (ages 1-3)</option>
          <option value="BoosterSeat">Booster Seat (ages 3-6)</option>
        </select>
      </div>
      <div class="col-md-1 mb-3">
        <input id="childSeatNumber" min="0" type="number" name="childSeatNumber" class="form-control">
      </div>
      <div class="col-md-1 text-danger text-center">
        <h2>
          <i id="delChild_${childNo}" class="fa fa-times deleteStops" aria-hidden="true">
          </i>
        </h2>
      </div>
    </div>

    <script>

      $("#delChild_`+childNo+`").click((e)=>{
        e.preventDefault();
        let id = $(e.target).attr("id");
        let arr = id.split("_");
        let childNum = arr[1];
        $("#child_`+childNo+`").remove();
      });

    </script>
  `;
  $(html_childSeat).insertBefore('#childDiv');
  childNo++;
});

// add Stop button
let stopNo = 1;
$('#addStop').click((e)=>{
  e.preventDefault();
  let html_stop = `
    <div id="stop_${stopNo}" class="form-row">
      <div class="col-md-6 offset-md-3 mb-3">
        <input id="stop${stopNo}" type="text" class="form-control stops" placeholder="add your stop here" name="stops" required>
      </div>
      <div class="col-md-1 text-danger text-center">
        <h2>
          <i id="delStop_${stopNo}" class="fa fa-times deleteStops" aria-hidden="true">
          </i>
        </h2>
      </div>
    </div>`;

  $( $.parseHTML(html_stop) ).insertBefore( "#stopDiv" );

  let js = `
    <script>

      let input${stopNo} = document.getElementById("stop`+stopNo+`");
      let searchBox${stopNo} = new google.maps.places.SearchBox(input${stopNo},{
        componentRestrictions:{country:"us"}
      });

      $("#delStop_${stopNo}").click((e)=>{
        e.preventDefault();
        let id = $(e.target).attr("id");
        let arr = id.split("_");
        let stopNum = arr[1];
        function filteration(obj){
          return obj.location != input${stopNo}.value
        }
        wayPoints = wayPoints.filter(filteration);
        onChangeHandler();
        $("#stop_${stopNo}").remove();
      });

      searchBox${stopNo}.addListener('places_changed', function() {
        wayPoints.push({
          location : input${stopNo}.value,
          stopover : true
        });
        onChangeHandler();
      });

   </script>`;

 $(js).insertBefore('#stopDiv')

stopNo++;
});
