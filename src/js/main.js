$(document).ready(function(){

  $('a[href^="#"').on('click', function() {

      let href = $(this).attr('href');
  
      $('html, body').animate({
          scrollTop: $(href).offset().top
      });
      return false;
  });

  const swiper = new Swiper('.swiper-container', {

      direction: 'horizontal',
      slidesPerView : 3,
      loop: true,
    
      pagination: {
        el: '.swiper-pagination',
      },
    
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });

  $('.tab__link_item').on('click', function() {
   let tabName = $(this).data('tab'),
      tab = $('.tab__inner[data-tab="'+tabName+'"]');
   
   $('.tab__link_item.tab__active').removeClass('tab__active');
   $(this).addClass('tab__active');
   
   
   $('.tab__inner.tab__container_active').removeClass('tab__container_active');
   tab.addClass('tab__container_active');
   
});

  });