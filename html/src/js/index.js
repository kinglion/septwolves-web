;(function(win,$,doc){
	$(function(){
		$("#nav_control").ulSlider();
	});
	$.fn.ulSlider = function(){
		var $slider = $(this),
			$li = $slider.find("li");
		$li.each(function(){
			$(this).hover(function(){
				if($(this).find("li").size() > 0)
					$(this).children("ul").removeClass('hidden');
			},function(){
				if($(this).find("li").size() > 0)
					$(this).children("ul").addClass('hidden');
			});
		})
	}
}(window,jQuery,document));