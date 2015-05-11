function BadrSalesmanActivity (type){
	this.type = type;
	this.item_id = 0;
	this.item_price = 0;
	this.rate = 0;
	this.uId = '0';
	this.retailerToken = '0317f5648eddea571cb292568b159c8c'
	this.specifyRemoteUrl();
}

BadrSalesmanActivity.prototype.identifyUser = function(){
	  if ($.cookie("user_identity")){
      userId = $.cookie("user_identity");
    }else{
      userId = Math.round(new Date().getTime() + (Math.random() * 100));
      $.cookie("user_identity", userId);
    }
    this.uId = userId;
}

BadrSalesmanActivity.prototype.specifyRemoteUrl = function(){
		//TODO change this url to real machine 
	this.url = 'http://badrsalesman:3000/api/v1/activities/log_activity';
};

BadrSalesmanActivity.prototype.sendActivity = function(){
  this.identifyUser()
	$.ajax({
    type: 'POST',
    url: this.url ,
    data:{
      access_token: this.retailerToken,
      activities:{
        activity_type: this.type,
        item_id: $('meta[name=item_id]').attr('content') ,
        price: $('meta[name=price]').attr('content') ,
        rating_value: $('.rate').attr('data') ,
        session_time: window.timeDiff/100  //time in seconds
      },
    	user_data: {
      	user_cookie_id: this.uId,
    	}
    },
    crossDomain: true,
    contentType: "application/json; charset=utf-8",
    dataType: "jsonp",
    async: false,
    cache: false
  });
};

function BadrSalesmanRecommender(){
	this.item_id = 0;
	this.uId = '0';
	this.retailerToken = '0317f5648eddea571cb292568b159c8c'
}

BadrSalesmanRecommender.prototype.getRecommendations = function(){
	//TODO change this url to real machine 
	this.url = 'http://badrsalesman:3000/api/v1/recommendations/get_recommendation';
  this.identifyUser();
  if ($('meta[name=item_id]').length > 0 ){
		recommendation_item_data = {
      item_id: $('meta[name=item_id]').attr('content'),
      category_id: $('meta[name=category_id]').attr('content')
		}
  }else{
	recommendation_item_data = {}
  }
	$.ajax({
    type: 'GET',
    url: this.url ,
    data:{
      access_token: this.retailerToken,
      recommendation_data:{recommendation_item_data},
    	user_data: {
      	user_cookie_id: this.uId,
    	}
    },
    crossDomain: true,
    contentType: "application/json; charset=utf-8",
    dataType: "jsonp",
    async: false,
    cache: false,
    jsonpCallback: 'jsonParser'
  });
};
//ToDo remove redunduncy 
BadrSalesmanRecommender.prototype.identifyUser = function(){
	  if ($.cookie("user_identity")){
      userId = $.cookie("user_identity");
    }else{
      userId = Math.round(new Date().getTime() + (Math.random() * 100));
      $.cookie("user_identity", userId);
    }
    this.uId = userId;
}


function jsonParser(recommendationJson){
	//ToDo handle failur case
	$.each(recommendationJson["Recommendations"], function(index, value){
		$('#badrSalesmanRecommendation').append("<div id='recommended_product'><a href=" + value[1]['url']+ ">	<label>" + value[1]['title'] + "</label><img src=" + value[1]['image'] + "/> </a></div>");
	});
	
}

// for view auto detection 

window.onbeforeunload = function(e){
	if ($('meta[name=activity]').length > 0 ){
		window.timeDiff = (new Date) - window.openTime //time in milliseconds
	  badrActivity = new BadrSalesmanActivity($('meta[name=activity]').attr('content'));
  	badrActivity.sendActivity();
	}
};

$( document ).ready(function(){
	window.openTime = new Date();
	if ($('#badrSalesmanRecommendation').length > 0){
		badrRecommender = new BadrSalesmanRecommender();
		badrRecommender.getRecommendations();
	}

});
