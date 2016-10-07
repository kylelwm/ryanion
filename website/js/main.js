$(document).ready(function () {
  //fake data
  var array_imgurls = ["http://static.zerochan.net/Pikachu.full.133224.jpg",
                "https://s-media-cache-ak0.pinimg.com/564x/61/b0/7f/61b07f7b4cff570870897cd7cedd3e7a.jpg",
                "http://s3.zerochan.net/Pok%C3%A9mon.240.1700546.jpg",
                "http://41.media.tumblr.com/492ca33d8ccfb62cf05b29b2f2c1051e/tumblr_necxhbumiT1ta0heqo1_500.jpg"];
  var albumName = "Pokemon Holiday 2016";

  populate_page();

  function populate_page() {
    populate_carousell(array_imgurls);
    populate_album_name(albumName);
  }

  function populate_carousell(array_image_urls) {
    if (array_image_urls.length == 0) {
      $( "#imagecarousell" ).append( "<p>I'm sorry, we found no images to upload</p><p>Please try again, we shall look into this matter</p>" );
    }
    else {
      $(".img-count").html(array_image_urls.length);
      $( "#imagecarousell" ).append( '<div class="img-items"></div>' );
      var images = "";
      for (i = 0; i < array_image_urls.length; i++) {
        images += '<div class="img-wrapper"><div class="img-selector"></div><div class="img-item">';
        images += '<img src="' +  array_image_urls[i] + '" class="thumbnail" state="selected">' + '</div></div></div>';
      }
      $( ".img-items" ).append( images );
    }
  }

  $( "#FBuploadBtn" ).on( "click", function() {
    upload_to_fb();
  });

  function populate_album_name(album_name) {
    $(".albumName").attr("placeholder", album_name);
  }


  function upload_to_fb() {
    console.log("button clicked");
    var selectedImgs = [];
    $("img").each(function() {
      var state = $(this).attr("state");
      var imgUrl = "";
      if (state == "selected") {
        imgUrl = $(this).attr("src");
        selectedImgs.push(imgUrl);
      }
    });

    console.log("selected imgs", selectedImgs);
    //do something here
  }


});

//image item
// <div class="img-items">
//                 <div class="img-wrapper" state="selected">
//                     <div class="img-selector">
//                     </div>
//                     <div class="img-item">
//                         <img src="blahblahblah" class="thumbnail">
//                     </div>
//                 </div>
//             </div>