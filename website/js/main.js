$(document).ready(function () {
  //fake data
  var array_imgurls = ["http://static.zerochan.net/Pikachu.full.133224.jpg",
                "https://s-media-cache-ak0.pinimg.com/564x/61/b0/7f/61b07f7b4cff570870897cd7cedd3e7a.jpg",
                "http://s3.zerochan.net/Pok%C3%A9mon.240.1700546.jpg",
                "http://41.media.tumblr.com/492ca33d8ccfb62cf05b29b2f2c1051e/tumblr_necxhbumiT1ta0heqo1_500.jpg",
                "http://s1.zerochan.net/Evolution.Family.600.1117044.jpg",
                "http://25.media.tumblr.com/tumblr_me7oemqwNQ1qkqxw0o3_500.png",
                "http://31.media.tumblr.com/ae1c56cd6455f867beb16185eb2530d7/tumblr_n62rorMVkG1sm2531o2_500.jpg"];
  var albumName = "Pokemon Holiday 2016";

  populate_page();

  function populate_page() {
    populate_carousell(array_imgurls);
    populate_album_name(albumName);
  }

  $(function() {
    if (typeof window.orientation == 'undefined') {
      moveScroller();
    }
  });

  function populate_carousell(array_image_urls) {
    if (array_image_urls.length == 0) {
      $( "#imagecarousell" ).append( "<p>I'm sorry, we found no images to upload</p><p>Please try again, we shall look into this matter</p>" );
    }
    else {
      $(".img-count").html(array_image_urls.length);
      $( "#imagecarousell" ).append( '<div class="img-items"></div>' );
      var images = "";
      for (i = 0; i < array_image_urls.length; i++) {
        console.log("print potato");
        images += '<div class="img-wrapper"><svg class="nc-icon glyph" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="48px" height="48px" viewBox="0 0 48 48"><g><path class="glyph-path glyph-path-selected" d="M24,1C11.3,1,1,11.3,1,24s10.3,23,23,23s23-10.3,23-23S36.7,1,24,1z M36.7,16.7l-16,16 C20.5,32.9,20.3,33,20,33s-0.5-0.1-0.7-0.3l-8-8c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l7.3,7.3l15.3-15.3c0.4-0.4,1-0.4,1.4,0 S37.1,16.3,36.7,16.7z"></path></g></svg><div class="img-selector img-selected" state="selected"><div class="img-item img-item-'+ i + '">';
        //images += '<img src="' +  array_image_urls[i] + '" class="thumbnail" state="selected">' + '</div></div></div>';
        images += '<img src="' + '" class="thumbnail" state="selected">' + '</div></div></div></div>';
      }
      $( ".img-items" ).append( images );

      for (i = 0; i < array_image_urls.length; i++) {
        var image = ".img-item-" + i;
        var $background = $(image);
        $($background).css("background-image", "url('" + array_image_urls[i] + "')");
      }


    }
  }

  $( "#FBuploadBtn" ).on( "click", function() {
    upload_to_fb();
  });


  $(".glyph").on( "click", function() {
    var selected = $(this);
    if (selected.next().attr("state") == "selected") {
      selected.find(".glyph-path").removeClass("glyph-path-selected");
      selected.find(".glyph-path").addClass("glyph-path-unselected");
      selected.next().removeClass("img-selected");
      selected.next().attr("state", "unselected");
    } else {
      selected.find(".glyph-path").removeClass("glyph-path-unselected");
      selected.find(".glyph-path").addClass("glyph-path-selected");
      selected.next().addClass("img-selected");
      selected.next().attr("state", "selected");
    }
  });

  function populate_album_name(album_name) {
    $(".albumName").attr("value", album_name);
    $(".albumName-top").html(album_name);
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

  function moveScroller() {
    var $anchor = $("#scroller-anchor");
    var $scroller = $-('#scroller');

    var move = function() {

        var st = $(window).scrollTop();
        var ot = $anchor.offset().top;
        if(st > ot) {
            $scroller.css({
                position: "fixed",
                top: "0px"
            });
          $scroller.show();
        } else {
            $scroller.hide();
            if(st <= ot) {
                $scroller.css({
                    position: "relative",
                    top: ""
                });
            }
        }
    };
    $(window).scroll(move);
    move();
  }

});
