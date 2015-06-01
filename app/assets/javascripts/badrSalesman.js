base_url = "http://badrsalesman:3000";

function identifyUser(){
  if ($.cookie("user_identity")){
    userId = $.cookie("user_identity");
  }else{
    userId = Math.round(new Date().getTime() + (Math.random() * 100));
    $.cookie("user_identity", userId);
  }
  return userId;
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function initCookies(){
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
}

var BadrSalesmanActivity = function(access_token, options){
  this.item_id = 0;
  this.item_price = 0;
  this.rate = 0;
  this.cookieUserId = identifyUser();
  if(typeof options['user_id'] === undefined){
    if ($('meta[name=user_id]').length > 0 ){
      this.userId = $('meta[name=user_id]').attr('content')
    }
  }else{
    this.userId = options['user_id']
  }

  if(typeof options['item_id'] === undefined){
    if ($('meta[name=item_id]').length > 0 ){
      this.itemId = $('meta[name=item_id]').attr('content')
    }
  }else{
    this.itemId = options['item_id']
  }


  this.retailerToken = access_token;

  this.url = base_url + '/api/v1/activities/log_activity';
  this.activity_types = ["view", "order", "purchase", "rate"];
}

BadrSalesmanActivity.prototype.sendActivity = function(activity_type){
  if(this.activity_types.indexOf(activity_type) > -1){ // Valid activity type
    $.ajax({
      type: 'POST',
      url: this.url ,
      data:{
        access_token: this.retailerToken,
        activities:{
          activity_type: activity_type,
          item_id: this.itemId ,
          price: $('meta[name=price]').attr('content') ,
          rating_value: $('.rate').attr('data') ,
          session_time: window.timeDiff/100  //time in seconds
        },
        user_data: { user_cookie_id: this.cookieUserId, user_forign_id: this.userId}
      },
      crossDomain: true,
      contentType: "application/json; charset=utf-8",
      dataType: "jsonp",
      async: false,
      cache: false
    });
    
  }

};


// -------------------------- Recommender ----------------------
var BadrSalesmanRecommender = function(access_token, options){
  initCookies();
  this.item_ids = 0;
  this.retailerToken = access_token;
  this.itemId = options['item_id'];

  this.cookieUserId = identifyUser();
  if(typeof options['user_id'] === undefined){
    if ($('meta[name=user_id]').length > 0 ){
      this.userId = $('meta[name=user_id]').attr('content')
    }
  }else{
    this.userId = options['user_id']
  }

  if(typeof options['item_id'] === undefined){
    if ($('meta[name=item_id]').length > 0 ){
      this.itemId = $('meta[name=item_id]').attr('content')
    }
  }else{
    this.itemId = options['item_id']
  }
  

  if ($('#badrSalesmanRecommendation').length > 0){
    this.getRecommendations();
  }
  if ($('#badrSalesmanPromotion').length > 0){
    this.getPromotions();
  }

  this.activity = new BadrSalesmanActivity(access_token, options);
  var that_activity = this.activity
  window.onbeforeunload = function(e){
    window.timeDiff = (new Date) - window.openTime //time in milliseconds
    that_activity.sendActivity('view');
  };

}

BadrSalesmanRecommender.prototype.sendActivity = function(type){
  this.activity.sendActivity(type);
}

BadrSalesmanRecommender.prototype.getRecommendations = function(){
  this.url = base_url + '/api/v1/recommendations/get_recommendation';
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
      recommendation_data: {recommendation_item_data: recommendation_item_data},
      user_data: { user_cookie_id: this.cookieUserId, user_forign_id: this.userId}
    },
    crossDomain: true,
    contentType: "application/json; charset=utf-8",
    dataType: "jsonp",
    async: false,
    cache: false,
    jsonpCallback: 'recommendationJsonParser'
  });
};


BadrSalesmanRecommender.prototype.getPromotions = function(){
  this.url = base_url + '/api/v1/promotions/get_promotions';
  $.ajax({
    type: 'GET',
    url: this.url ,
    data:{
      access_token: this.retailerToken,
      user_data: { user_cookie_id: this.cookieUserId, user_forign_id: this.userId }
    },
    crossDomain: true,
    contentType: "application/json; charset=utf-8",
    dataType: "jsonp",
    async: false,
    cache: false,
    jsonpCallback: 'promotionsJsonParser'
  });
};

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
      $('#badrSalesmanRecommendation').append("<div id='recommended_product' style='margin-bottom: 5px;width:150px; height:120px; float: left; margin-right: 10px; border: 1px solid gray; padding: 6px;'><a href=" + value[1]['url']+ "> <div style = 'height:60px'><img style='width:135px;height:90px;' src=" + value[1]['image'] + "></div><label style='text-align: center;margin-top: 30px;text-overflow: ellipsis;width: 150px;overflow: hidden;white-space: nowrap;'>" + value[1]['title'] + "</label></a></div>");
    });
    $('#badrSalesmanRecommendation').attr('style',"border: 1px solid #BFBFBF; display: inline-block; padding: 14px;border-radius: 5px;margin-bottom: 5px;  width: 101%;");
  }
  
}

$( document ).ready(function(){
  access_token = "1c3d5a1b870cb66eabb05d501a701dfc";
  var user_id = $('meta[name=user_id]').attr('content');
  var item_id = $('meta[name=item_id]').attr('content');

  badrRecommender = new BadrSalesmanRecommender(access_token, {'user_id': user_id, 'item_id': item_id});
});
