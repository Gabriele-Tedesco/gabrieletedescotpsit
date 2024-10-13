$(document).ready( function() {

   z=5;
   for(i=0;i<z;i++)
   {

      nuovo = document.createElement('div');
      nuovo.setAttribute('id', 'd'+i);
      nuovo.setAttribute('class', 'miediv');
      $("body").append(nuovo);

      t=10;
      l=100+(i*50);
      $("#d"+i).css({
         'top':t,
         'left':l
      });
   }
});   

