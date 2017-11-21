$('#gameplay').live('pageshow',function(event, ui){


     /* GLOBAL VARIABLES */

    // variable to track filled mini card slots

    var slot1Status = "";
    var slot2Status = "";
    var slot3Status = "";

    
    var currentContainer = "";
    var currentCardID = "";

    var nextOpenSlot = "";
    var nextMiniCard = "";

    var slotsFull = "false";

    var currentCard = "";

    var removeId = "";
    var currentAction = "default";
    var replacing = "false";
    var swapping = "false";
    var slotRemovedFrom = "";

    var SwappedDataID = "";

    // option to skip initial confirmations
    var skipConfirmation = "true";

      // skip loading animation
    var skipLoading = "false";

    // current pick variables
    var propId = "";
    var playerName = "";
    var propValue = "";
    var propCat = "";
    var propLessMore = "";
    var propHex = "";

    // tooltip tracking
    var showedSubmitTT = "false";


     // build carousel and add click bindings 

     var buildCarousel = function(){

      // Remove Loading Classes on Cards
        $('#cards-carousel .card-container').css("display", "block");

        $('#cards-carousel').slick({
            arrows: false,
            centerMode: true,
            centerPadding: '60px',
            slidesToShow: 3,
            speed: 200,
            responsive: [
              {
                breakpoint: 768,
                settings: {
                  arrows: false,
                  centerMode: true,
                  centerPadding: '100px',
                  slidesToShow: 1
                }
              },
              {
                breakpoint: 480,
                settings: {
                  arrows: false,
                  centerMode: true,
                  centerPadding: '25px',
                  slidesToShow: 1
                  }
                },
              {
                breakpoint: 415,
                settings: {
                  arrows: false,
                  centerMode: true,
                  centerPadding: '72px',
                  slidesToShow: 1,
                 } 
                },
                {
                breakpoint: 376,
                settings: {
                  arrows: false,
                  centerMode: true,
                  centerPadding: '52px',
                  slidesToShow: 1,
                  }
                },
                {
                breakpoint: 321,
                settings: {
                  arrows: false,
                  centerMode: true,
                  centerPadding: '25px',
                  slidesToShow: 1,
                }
              }
            ]
        });


      /* CLICK EVENTS */

     $('body').on('tap', '.prop-btn-group a', function(){     

       var propData = $(this).data("prop");
       popPick(propData);
      
      });


      $('body').on('tap', '.cancel-pick', function(){ 

           cancelPick();

      });


      $('body').on('tap', '.remove-pick', function(){ 

           var removeData = $(this).data("remove");
           removePick(removeData);

      });



      $('body').on('tap', '.confirm-button', function(){ 

           var propSlot = $(this).attr('id');
           confirmPick(propSlot);

      });


      $('body').on('tap', '.mini-card', function(){ 

           var slideTo = $(this).attr('data-id');
           $('#cards-carousel').slick('slickGoTo',slideTo);

      });

      $('body').on('tap', 'header #btn-submit', function(){
           $('#confirm-modal').show();
      });

      $('body').on('tap', '#confirm-modal a', function(){
           $('#confirm-modal').hide();
      });

      $('body').on('tap', '.fa-bar-chart', function(){
           $(this).parents('.card-container').toggleClass('flip');
      });

      $('body').on('tap', '.flip-close', function(){
           $(this).parents('.card-container').toggleClass('flip');
      });


      // on swipe of carousel call Cancel function to cancel any active pick
      
        $('#cards-carousel').on('swipe', function(event, slick, direction){
            if (currentAction == "picking") {
            cancelPick();
             }
        });

     }


     var animateSlots =function() {
      
      $('.loading-messages').removeClass('animated zoomIn');
      $('.loading-messages').addClass('animated zoomOut');
      $('.loading-messages').css('display', 'none');

      $('.mini-card-slot').each(function(i) {
        
        //console.log($(this));
        var miniSlotAnimating = $(this);
        // console.log(miniSlotAnimating);
        
        setTimeout(function () { miniSlotAnimating,
           
           $(miniSlotAnimating).css('display', 'block');
           $(miniSlotAnimating).addClass('animated zoomIn');

           }, i*100);

        setTimeout(function(){$('.mini-card-slot').removeClass('animated zoomIn');},400);  
      });

      }


     var entranceAnimation = function(){

     
     $('.loading-messages').css('display', 'block');
     $('.loading-messages').addClass('animated zoomIn');


     $('#cards-carousel').css("opacity","1");

     // disable swiping of carousel during entrance animation
     $('#cards-carousel').slick("slickSetOption", "swipe", false, false);


     // hard code the count for now
     var cardCount = $('#cards-carousel .card-container').not( ".slick-cloned,.slick-active" ).length-1;

     setTimeout(function(){

     $('#cards-carousel .card-container').not( ".slick-cloned,.slick-active").each(function(i) {
        setTimeout(function(){
        var currentSlide = $('#cards-carousel').slick('slickCurrentSlide');
        var prevSlide = currentSlide;
        var nextSlide = currentSlide + 3;
        $('#cards-carousel .card-container').filter('[data-slick-index="'+prevSlide+'"]').addClass('beenintroduced');    
        $('#cards-carousel').slick('slickNext'); 
        if (i==(cardCount - 1)) {
          console.log(nextSlide);
          $('#cards-carousel .card-container').filter('[data-slick-index="'+nextSlide+'"]').addClass('beenintroduced');
        }
        if (i==(cardCount)) {
          $('#cards-carousel .card-container').addClass('beenintroduced');
          $('.card .prop-btn-group a').css('pointer-events','auto');
          $('#cards-carousel').slick("slickSetOption", "swipe", true, false);
          $('#cards-carousel').slick("slickSetOption", "speed", "600", false);
          setTimeout(function(){animateSlots()},1000);
          setTimeout(function(){$('.card .prop-btn-group a').css({'background-color':'#3f79cd','color':'#fff','border-color':'#3f79cd'});},1800);
        }
           // adjust speed of card entrances
           }, i*500);  
      });
      }, 1000);

     }

  
  // for debugging, skip the loading animation

  if (skipLoading == "false") {

     buildCarousel();
     
     setTimeout(function(){entranceAnimation()},1000);

   } else {

    buildCarousel();
    $('#cards-carousel').css("opacity","1");
    $('#cards-carousel').slick("slickSetOption", "draggable", true, false);
    $('#cards-carousel .card-container').addClass('beenintroduced');
    $('.mini-card-slot').css('display', 'block');
    $('.card .prop-btn-group a').css('pointer-events','auto');

   }


     /* FUNCTIONS */

    var popPick = function(propData){

      
      currentAction="picking";

      // Extrapolate Values in Array

      propId = propData[0];
      playerName = propData[1];
      propValue = propData[2];
      propCat = propData[3];
      propLessMore = propData[4];
      propHex = propData[5];
      // console.log(propLessMore);

      
      // Update Buttons

     // Get Buttons in Current Card

     currentCard = "#card-"+propId;

     
     // Change Buttons based on less or more

     if (propLessMore == "Or Less") {

     $(currentCard + ' .btn-or-more').removeClass('selected');
     $(currentCard + ' .btn-or-more').addClass('unselected');
     $(currentCard + ' .btn-or-less').removeClass('unselected');
     $(currentCard + ' .btn-or-less').addClass('selected');

     }  else {

     $(currentCard + ' .btn-or-less').removeClass('selected');
     $(currentCard + ' .btn-or-less').addClass('unselected');
     $(currentCard + ' .btn-or-more').removeClass('unselected');
     $(currentCard + ' .btn-or-more').addClass('selected');


     }

    // check if the card is already selected. If true, set the card to swap out
    
    if (propId == slot1Status) {
        replacing = "true";
        nextMiniCard = "#mini-card-1";
      } else if (propId == slot2Status){
        replacing = "true";
        nextMiniCard = "#mini-card-2";
    } else if (propId == slot3Status){
        replacing = "true";
        nextMiniCard = "#mini-card-3"; 
    } else { 
       replacing = "false";
    }

    // console.log(nextMiniCard);


    if (replacing == "false") {
    
    // Identify Confirm Buttons to Be shown. Check Global Variable. If they're all filled exit the function and enter the swap/replace function

    if (slot1Status == "") { nextOpenSlot = "#confirm-slot-1";}
    if ((slot1Status != "") && (slot2Status == "")) { nextOpenSlot = "#confirm-slot-2";}
    if ((slot1Status != "") && (slot2Status != "")) { nextOpenSlot = "#confirm-slot-3"; }
    if ((slot1Status != "") && (slot2Status != "") && (slot3Status != "")) { swapping = "true"; }


    // Identify Mini Cards to Build. Check Global Variable.  If they're all filled exit the function to the swap function

    if (slot1Status == "") { nextMiniCard = "#mini-card-1"; }
    if ((slot1Status != "") && (slot2Status == "")) { nextMiniCard = "#mini-card-2"; }
    if ((slot1Status != "") && (slot2Status != "")) { nextMiniCard = "#mini-card-3"; }
    if ((slot1Status != "") && (slot2Status != "") && (slot3Status != "")) { swap(propId); return false; }

    }


    // if we choose to skip the confirmations on initial picks then just confirm the pick. based on skipConfirmation variable

    if ((skipConfirmation != "true" || slotsFull == "true") && replacing == "false") {
      showConfirm(propId,"false");
      } else {
        confirmPick();
      }
    }


    var showConfirm = function(propId){     


     if (slotsFull == "false") {
     $('#cancel-'+propId).css('display', 'block');
     $(nextOpenSlot).css('display', 'block');
     $(nextOpenSlot).removeClass('animated flipOutX');
     $(nextOpenSlot).addClass('animated flipInX'); 

      } else {
     $('#cancel-'+propId).css('display', 'block');
     $(".confirm-button").css('display', 'block');
     $(".confirm-button").removeClass('animated flipOutX');
     $(".confirm-button").addClass('animated flipInX'); 

      }
  
    }


    // function to handle swapping or replacing a card. Might be just be a delegate function


    var swap = function(propId){

      showConfirm(propId,"true");
    //  console.log("swapReplace");

    }


    var confirmPick = function(propSlot){     

    currentAction="default";

    if (swapping == "true") {
     nextMiniCard = $('#'+propSlot).siblings('.mini-card').attr("id");
     nextMiniCard = "#"+nextMiniCard;

      // Remove Previous Mini Card
     SwappedDataID = $(nextMiniCard).attr("data-id");
     removePick("",SwappedDataID);
    
    }
     
    // Build Mini Card

    $(nextMiniCard + ' p.prop-name').html(playerName);
    $(nextMiniCard + ' p.prop-value').html(propValue);
    $(nextMiniCard + ' p.prop-category').html(propCat);
    $(nextMiniCard + ' p.more-less').html(propLessMore);
    $(nextMiniCard).css('background-color', propHex);
    $(nextMiniCard).attr("data-id",propId);


     // current slot id

    currentContainer = $(nextMiniCard).parent().attr("id");
    currentCardID = $(nextMiniCard).attr("data-id");


    // show a little animation that indicates the card is changing
    if (replacing == "true") {
      
      $('.confirm-button').css('display', 'none');
      $(nextMiniCard).removeClass('animated bounceInDown');
      $(nextMiniCard).removeClass('animated flipInY');
      $(nextMiniCard).addClass('animated flipInY');
      setTimeout(function(){$(nextMiniCard).removeClass('animated flipInY');},1000);
    
    } else {

     $('.confirm-button').css('display', 'none');
     $(nextMiniCard).css('display', 'block');
     $(nextMiniCard).removeClass('animated bounceOutUp');
     $(nextMiniCard).addClass('animated bounceInDown');

    }
     

     $('.cancel-pick').css('display', 'none');
     
     // Show only current remove button

     $('#remove-'+currentCardID).css('display', 'block');


     // Update global slots variables so we know which one has picks

     if (currentContainer == "slot-1") { 
        slot1Status = currentCardID;
      } else if (currentContainer == "slot-2") { 
        slot2Status = currentCardID; 
      } else if (currentContainer == "slot-3") { 
        slot3Status = currentCardID;
     }

     checkifComplete();

    }


    var checkifComplete = function(){

       if ((slot1Status != "") && (slot2Status != "") && (slot3Status != "")) { 
          $('#btn-submit').css("color","#fff200");
          $('#btn-submit').css("pointer-events", "auto");
          slotsFull=true;

          // if ready to submit and haven't shown tooltip yet, show it
          if (showedSubmitTT == "false") {
            setTimeout(function(){$('header #btn-submit').qtip('toggle', true);},2000);
           // console.log(showedSubmitTT);
            showedSubmitTT = "true";
          }

       } else {
          $('#btn-submit').css("color","#ccc");
          $('#btn-submit').css("pointer-events", "none");
          slotsFull=false;
      }

       // RESET STATES
       replacing="false";
       swapping="false";

    } 

    var cancelPick = function(){     
     $(currentCard + ' .btn-or-more').removeClass('selected unselected');
     $(currentCard + ' .btn-or-less').removeClass('selected unselected');
     $('.cancel-pick').css('display', 'none');
     $('.confirm-button').removeClass('flipInX');
     $('.confirm-button').addClass('flipOutX');

     // RESET STATES
      replacing="false";
      swapping="false";
    }

     
     var removePick = function(removeData, cardGettingSwapped){     
     
     
     // IF SWAPPING THE CARD SET THE CARD TO BE REMOVED TO THE PREVIOUS OCCUPIED CARD

     if (swapping == "true") {
      removeId = cardGettingSwapped;      
     } else {
      removeId = removeData[0];
     }
     

    slotRemovedFrom = $('.mini-card[data-id=' + removeId + ']').parent().attr("id");

    // Update global slots variables so we know which one has picks

     if (slotRemovedFrom == "slot-1") { 
        slot1Status = "";
      } else if (slotRemovedFrom == "slot-2") { 
        slot2Status = ""; 
      } else if (slotRemovedFrom == "slot-3") { 
        slot3Status = "";
     }


     $('#card-' +removeId + ' .btn-or-less').removeClass('selected unselected');
     $('#card-' +removeId + ' .btn-or-more').removeClass('selected unselected');
     var removeLink = '#remove-' +removeId;
     $(removeLink).css('display', 'none');

     $('.mini-card[data-id=' + removeId + ']').removeClass('animated bounceInDown');
     $('.mini-card[data-id=' + removeId + ']').addClass('animated bounceOutUp');
    
     checkifComplete();

    }


   // CREATE THE HELPER TOOLTIPS
   $('header #btn-submit').qtip({ // Grab some elements to apply the tooltip to
    show: {
        event: 'false',
       // modal: true,
    },
    content: {
        text: 'Tap to Submit, or Change Your Picks'
    },
    style: {
        classes: 'qtip-dark'
    },
     position: {
        my: 'center right',  // Position my top left...
        at: 'center left', // at the bottom right of...
        target: $('header #btn-submit'), // my target
         adjust: {
            x: -10
        }
    },
    hide: {
        event: false,
        inactive: 4000
    }
    })

   var toolTipAPI = $('header #btn-submit').qtip('api');

   });
