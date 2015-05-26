function BadrSalesmanActivity(type){
	this.type = type;
	this.item_id = 0;
	this.item_price = 0;
	this.rate = 0;
  this.cookieUserId = '0';
	this.userId = '0';
	this.retailerToken = '55b21feecb7562083395d320b226f77f'
	this.specifyRemoteUrl();
}

BadrSalesmanActivity.prototype.identifyUser = function(){
	  if ($.cookie("user_identity")){
      cUserId = $.cookie("user_identity");
    }else{
      cUserId = Math.round(new Date().getTime() + (Math.random() * 100));
      $.cookie("user_identity", cUserId);
    }
    this.cookieUserId = cUserId;
    if ($('meta[name=user_id]').length > 0 ){
      this.userId = $('meta[name=user_id]').attr('content')
    }

}

BadrSalesmanActivity.prototype.specifyRemoteUrl = function(){
		//TODO change this url to real machine 
	this.url = 'http://salesman.badrit.com/api/v1/activities/log_activity';
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
      	user_cookie_id: this.cookieUserId,
        user_forign_id: this.userId
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
	this.item_ids = 0;
	this.cookieUserId = '0';
  this.userId = '0';
  this.retailerToken = "55b21feecb7562083395d320b226f77f"
}

BadrSalesmanRecommender.prototype.getRecommendations = function(){
	//TODO change this url to real machine 
	this.url = 'http://salesman.badrit.com/api/v1/recommendations/get_recommendation';
  this.identifyUser();
  if ($('meta[name=item_id]').length > 0 ){
		recommendation_item_data = {
      item_ids:  $.cookie("products"), //$('meta[name=item_id]').attr('content'),
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
      recommendation_data:{recommendation_item_data: recommendation_item_data},
    	user_data: {
      	user_cookie_id: this.cookieUserId,
        user_forign_id: this.userId
    	}
    },
    crossDomain: true,
    contentType: "application/json; charset=utf-8",
    dataType: "jsonp",
    async: false,
    cache: false,
    jsonpCallback: 'recommendationJsonParser'
  });
};
//ToDo remove redunduncy 
BadrSalesmanRecommender.prototype.identifyUser = function(){
	  if ($.cookie("user_identity")){
      cUserId = $.cookie("user_identity");
    }else{
      cUserId = Math.round(new Date().getTime() + (Math.random() * 100));
      $.cookie("user_identity", userId);
    }
    this.cookieUserId = cUserId;
    if ($('meta[name=user_id]').length > 0 ){
      this.userId = $('meta[name=user_id]').attr('content')
    }

}



BadrSalesmanRecommender.prototype.getPromotions = function(){
  //TODO change this url to real machine 
  this.url = 'http://salesman.badrit.com/api/v1/promotions/get_promotions';
  this.identifyUser();
  $.ajax({
    type: 'GET',
    url: this.url ,
    data:{
      access_token: this.retailerToken,
      user_data: {
        user_cookie_id: this.cookieUserId,
        user_forign_id: this.userId
      }
    },
    crossDomain: true,
    contentType: "application/json; charset=utf-8",
    dataType: "jsonp",
    async: false,
    cache: false,
    jsonpCallback: 'promotionsJsonParser'
  });
};
//ToDo remove redunduncy 
BadrSalesmanRecommender.prototype.identifyUser = function(){
    if ($.cookie("user_identity")){
      cUserId = $.cookie("user_identity");
    }else{
      cUserId = Math.round(new Date().getTime() + (Math.random() * 100));
      $.cookie("user_identity", cUserId);
    }
    this.cookieUserId = cUserId;
    if ($('meta[name=user_id]').length > 0 ){
      this.userId = $('meta[name=user_id]').attr('content')
    }

}


function promotionsJsonParser(promotionJson){
  //ToDo handle failur case
  if (promotionJson['Offers'].length > 0){
    $('#badrSalesmanPromotion').append("<h4>Promoted Products</h4>");
    $.each(promotionJson["Offers"], function(index, value){
      $('#badrSalesmanPromotion').append("<div id='promoted_product' style='margin-bottom: 5px;width:150px; height:155px; float: left; margin-right: 10px; border: 1px solid gray; padding: 6px;'><a href=" + value['url']+ "> <div style = 'height:60px'><img style='width:135px;height:90px;' src=" + value['image'] + "></div><label style='text-align: center;margin-top: 30px;text-overflow: ellipsis;width: 150px;overflow: hidden;white-space: nowrap;'>" + value['title'] + "</label></br><label><strike style='color: red;'>"+round(value['originalPrice'], 2)+"</strike>&nbsp;"+round(value['discountedPrice'], 2)+"</label></a></div>");
    });
    $('#badrSalesmanPromotion').attr('style',"border: 1px solid #BFBFBF; display: inline-block; padding: 14px;border-radius: 5px;margin-bottom: 5px;  width: 31%;");
  }
  
}

function recommendationJsonParser(recommendationJson){
	//ToDo handle failur case
  if (recommendationJson['Recommendations'].length > 0){
    $('#badrSalesmanRecommendation').append("<h4>Recommended Products for you </h4>");

    $.each(recommendationJson["Recommendations"], function(index, value){
  		$('#badrSalesmanRecommendation').append("<div id='recommended_product' style='margin-bottom: 5px;width:150px; height:120px; float: left; margin-right: 10px; border: 1px solid gray; padding: 6px;'><a href=" + value[1]['url']+ ">	<div style = 'height:60px'><img style='width:135px;height:90px;' src=" + value[1]['image'] + "></div><label style='text-align: center;margin-top: 30px;text-overflow: ellipsis;width: 150px;overflow: hidden;white-space: nowrap;'>" + value[1]['title'] + "</label></a></div>");
  	});
    $('#badrSalesmanRecommendation').attr('style',"border: 1px solid #BFBFBF; display: inline-block; padding: 14px;border-radius: 5px;margin-bottom: 5px;  width: 101%;");
  }
	
}

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
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

  if ($.cookie("products")){
    if ($.cookie("products").indexOf($('meta[name=item_id]').attr('content')) < 0){
      $.cookie("products", $.cookie("products") +','+  $('meta[name=item_id]').attr('content'), {expires: new Date($.cookie("products_expiration"))});
    }
  }else{
    var date = new Date();
    date.setTime(date.getTime() + (15 * 60 * 1000));
    $.cookie("products_expiration", date);
    $.cookie("products", $('meta[name=item_id]').attr('content'), { expires: date});
  }
	badrRecommender = new BadrSalesmanRecommender();
  if ($('#badrSalesmanRecommendation').length > 0){
		badrRecommender.getRecommendations();
	}
  if ($('#badrSalesmanPromotion').length > 0){
    badrRecommender.getPromotions();
  }

});
