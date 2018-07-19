var positions = [];
function initAutocomplete() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var map = new google.maps.Map(document.getElementById('map'), {
  center: new google.maps.LatLng(41.8781, -87.6298),
  zoom: 4,
  mapTypeId: 'roadmap'
});

// Cities with extra charge
// var citymap = {
//   chicago: {
//     center: {lat: 41.878, lng: -87.629},
//     distance: 2714856
//   },
//   newyork: {
//     center: {lat: 40.714, lng: -74.005},
//     distance: 8405837
//   },
//   losangeles: {
//     center: {lat: 34.052, lng: -118.243},
//     distance: 3857799
//   },
//   vancouver: {
//     center: {lat: 49.25, lng: -123.1},
//     distance: 603502
//   }
// };
//
// for (var city in citymap) {
//   // Add the circle for this city to the map.
//   var cityCircle = new google.maps.Circle({
//     strokeColor: '#FF0000',
//     strokeOpacity: 0.8,
//     strokeWeight: 2,
//     fillColor: '#FF0000',
//     fillOpacity: 0.35,
//     map: map,
//     center: citymap[city].center,
//     radius: Math.sqrt(citymap[city].distance) * 100
//   });
// }


// drawing path
directionsDisplay.setMap(map);

var onChangeHandler = function() {
  calculateAndDisplayRoute(directionsService, directionsDisplay);
};

// Create the search box and link it to the UI element.
var input = document.getElementById('input');
var input2 = document.getElementById('input2');
var searchBox = new google.maps.places.SearchBox(input,{
  componentRestrictions: {country: 'us'}
});
var searchBox2 = new google.maps.places.SearchBox(input2,{
  componentRestrictions: {country: 'us'}
});

// Bias the SearchBox results towards current map's viewport.
map.addListener('bounds_changed', function() {
  searchBox.setBounds(map.getBounds());
});

map.addListener('bounds_changed', function() {
  searchBox2.setBounds(map.getBounds());
});




//
//
//
//
var markers = [];
// Listen for the event fired when the user selects a prediction and retrieve
// more details for that place.
searchBox.addListener('places_changed', function() {
  var places = searchBox.getPlaces();

  if (places.length == 0) {
    return;
  }

  // Clear out the old markers.
  markers.forEach(function(marker) {
    marker.setMap(null);
  });
  markers = [];

  // For each place, get the icon, name and location.
  var bounds = new google.maps.LatLngBounds();
  places.forEach(function(place) {
    if (!place.geometry) {
      console.log("Returned place contains no geometry");
      return;
    }
    var icon = {
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25)
    };

    // Create a marker for each place.

    var marker = new google.maps.Marker({
      map: map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      title: place.name,
      position: place.geometry.location
    })

     markers.push(marker);
     positions[0] = marker.getPosition().lat();
     positions[1] = marker.getPosition().lng();

     if (positions[2] && positions[3]) {
       onChangeHandler();
     }


    // poup window for coordinates
     var infowindow = new google.maps.InfoWindow({
        content: '<p>Marker Location:' + marker.getPosition() + '</p>'
      });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);
      });

    google.maps.event.addListener(marker, 'drag', function() {
      infowindow.close();
      infowindow = new google.maps.InfoWindow({
         content: '<p>Marker Location:' + marker.getPosition() + '</p>'
      });
    });

    google.maps.event.addListener(marker, 'dragend', function() {
      positions[0] = marker.getPosition().lat();
      positions[1] = marker.getPosition().lng();
      onChangeHandler();
    });

     if (place.geometry.viewport) {
       // Only geocodes have viewport.
       bounds.union(place.geometry.viewport);
     } else {
       bounds.extend(place.geometry.location);
     }
   });
   map.fitBounds(bounds);
 });





//
//
//
//
//
// search box2
//
//
var markers2 = [];
searchBox2.addListener('places_changed', function() {
 var places2 = searchBox2.getPlaces();

 if (places2.length == 0) {
   return;
 }

 // Clear out the old markers.
 markers2.forEach(function(marker) {
   marker.setMap(null);
 });
 markers2 = [];

 // For each place, get the icon, name and location.
 var bounds2 = new google.maps.LatLngBounds();
 places2.forEach(function(place) {
   if (!place.geometry) {
     console.log("Returned place contains no geometry");
     return;
   }
   var icon = {
     url: place.icon,
     size: new google.maps.Size(71, 71),
     origin: new google.maps.Point(0, 0),
     anchor: new google.maps.Point(17, 34),
     scaledSize: new google.maps.Size(25, 25)
   };

   // Create a marker for each place.
   var marker2 = new google.maps.Marker({
     map: map,
     draggable: true,
     animation: google.maps.Animation.DROP,
     title: place.name,
     position: place.geometry.location
   })

    markers2.push(marker2);
    positions[2] = marker2.getPosition().lat();
    positions[3] = marker2.getPosition().lng();
    onChangeHandler();

    // poup window for coordinates
     var infowindow = new google.maps.InfoWindow({
        content: '<p>Marker Location:' + marker2.getPosition() + '</p>'
      });

    google.maps.event.addListener(marker2, 'click', function() {
        infowindow.open(map, marker2);
      });

    google.maps.event.addListener(marker2, 'drag', function() {
      infowindow.close();
      infowindow = new google.maps.InfoWindow({
         content: '<p>Marker Location:' + marker2.getPosition() + '</p>'
       });
    });

    google.maps.event.addListener(marker2, 'dragend', function() {
      positions[2] = marker2.getPosition().lat();
      positions[3] = marker2.getPosition().lng();
      onChangeHandler();
    });

    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds2.union(place.geometry.viewport);
    } else {
      bounds2.extend(place.geometry.location);
    }
  });
  map.fitBounds(bounds2);
});

}



function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  console.log(positions[0],positions[1]);
  directionsService.route({
    origin: {lat: positions[0], lng: positions[1]},
    destination: {lat: positions[2], lng: positions[3]},
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
      var route = response.routes[0];
      console.log(route.legs[0].distance.text);
      document.getElementById('distance').value = route.legs[0].distance.text;
    } else if (status === 'ZERO_RESULTS') {
      window.location.href = '/form/newRide/1'
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

if ($("#map").length > 0){
  initAutocomplete();
}
