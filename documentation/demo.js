$(function() {
 $("#demo_res li").each(function(e){
   el = $(this);
   
   el.html(el.data("query"));
   
   Harvey.attach(el.data("query"),{
     on: new_screen_resolution,
   })
 })
});

function new_screen_resolution(){
  sel = $("li[data-query='"+this.condition+"']");
  $(".active-mq").removeClass("active-mq");
  sel.addClass("active-mq");
  $("#demo_image").attr("src", "documentation/images/" + sel.data("target") + ".jpg");
}