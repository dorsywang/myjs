/**
 * @author dorsywang
 * @version 1.0.0 
 * @email honghu91@hotmail.com
 */

var $ = function(base){

    //start选择器
  var Selector = {
    parsePattern: {
      //构造正则检测式

      //id
      idParse: new RegExp("^#"),
      
      //Tag
      tagParse: new RegExp("^[^#.]"),

      //class
      classParse: new RegExp("^."),

      //mutiExp like div#t
      mutiIdParse: new RegExp("(^[A-Za-z0-9_]+)#"),
      mutiClassParse: new RegExp("(^[A-Za-z0-9_]+)\\."),

      //eq:(1) 选择器
      eqParse: /:eq\(([0-9]+)\)/
    },

    //记录eq(n) 中的n
    eqNumber: -1,

    //做一些初始化的工作
    init: function(){
    },

    //结果数组
    resultArr: [],

    //获得基础匹配结果
    getBaseElement: function(b){

      //如果存在eq
      if(this.parsePattern.eqParse.test(b)){
        var parseResult = b.match(this.parsePattern.eqParse);

        //获得n
        this.eqNumber = parseResult[1];

        //去掉eq表达式
        b = b.replace(this.parsePattern.eqParse, "");
      }

      //分离空格选择器
      b = b.replace(/ +/g," ").split(" ");

      var resultArr = [];

      //得到最后一个标记匹配标记
      var lastElement = b[b.length - 1];

      //得到最后一个元素数组
      var lastElementArr = this.getElement(lastElement);

      var flag = 0;

      var _this = this;

      //递归检测父元素,curr...当前元素，curr...对应要检测标记的下标
      function checkParent(currentElement, currentNumber){

        if(currentNumber == 0){
          flag = 1;
          return;
        }

        var parentNode = currentElement.parentNode;

        //parent已为空了
        if(!parentNode || !parentNode.tagName) return;

        var parentMark = b[currentNumber - 1];

        if(_this.parsePattern.idParse.test(parentMark)){//若此标记是id标记

          //如果当前父节点的id匹配则用当前父节点和下一个下标继续检测
          if(parentNode.id == parentMark.replace("#", "")) checkParent(parentNode, -- currentNumber);

          //否则检测父节点和当前下标
          else{
              checkParent(parentNode, currentNumber);
          }

        }else if(_this.parsePattern.tagParse.test(parentMark)){

          if(parentNode.tagName.toLowerCase() == parentMark.toLowerCase()) checkParent(parentNode, -- currentNumber);
          else{
            checkParent(parentNode, currentNumber);
          }

        }else if(_this.parsePattern.classParse.test(parentMark)){

          if(parentNode.className == parentMark.replace(".", "")) checkParent(parentNode, -- currentNumber);
          else{
            checkParent(parentNode,currentNumber);
          }

        }else return;
      }

      for(var i = 0;i < lastElementArr.length;i ++){
        flag = 0;
        checkParent(lastElementArr[i],b.length - 1)
              if(flag) resultArr.push(lastElementArr[i]);
      }

      if(this.eqNumber > -1){
        if(resultArr[this.eqNumber]) resultArr = [resultArr[this.eqNumber]];
        else resultArr = [];
      }

      this.resultArr = resultArr;
    }, 

    //获得基础元素，id tag class
    getElement: function(b){
        var tag = null;

        //如果是div#t这种形式
        if(this.parsePattern.mutiIdParse.test(b)){

          tag = this.parsePattern.mutiIdParse.exec(b)[1];
          b = b.replace(this.parsePattern.mutiIdParse, "#");

        //如果是div.t这种形式
        }else if(this.parsePattern.mutiClassParse.test(b)){

          tag = this.parsePattern.mutiClassParse.exec(b)[1];
          b = b.replace(this.parsePattern.mutiClassParse, ".");

        }

        //返回获取元素，类型为数组    

        //如果是id匹配
        if(this.parsePattern.idParse.test(b)){
          var Ele = document.getElementById(b.replace("#", ""))

          //如果是存在div#t
          if(tag){
            if(Ele.tagName.toLowerCase() == tag.toLowerCase()) return [Ele];
          }else return [Ele];

        }else if(this.parsePattern.tagParse.test(b)) {

          return document.getElementsByTagName(b);

        }else if(this.parsePattern.classParse.test(b)){

          var tempArr = document.getElementsByTagName("*");
          var resultArr = [];
          var classPattern = new RegExp("( )*" + b.replace(".", ""));//构造动态的正则检测，检测如多类名情形："a b"

          //遍历检测类匹配
          for(var i in tempArr){

            if(tempArr[i].nodeType == 1){

              if(classPattern.test(tempArr[i].className)){

                //检测tagName是不是一致
                if(tag){
                  if(tempArr[i].tagName.toLowerCase() == tag.toLowerCase()) resultArr.push(tempArr[i]);
                }else resultArr.push(tempArr[i]);

              }
            } 
          }

          return resultArr;
        }
      }
    };
    //-----------End选择器

  if(base != document){
    base = Selector.getBaseElement(base);
    base = Selector.resultArr;
  }else base = [document];

  //构造主操作对象
  var main = {
    //baseElement为数组
    baseElement: base,

    //改变元素的html
    html: function(s){

      if(s == undefined){
          try{
              return this.baseElement[0].innerHTML;
          }catch(e){
              return undefined;
          }
      }

      for(var i in this.baseElement){
        try{
          this.baseElement[i].innerHTML = s;
        }catch(e){
          return;
        }
      }

      return this;
    },

    //增加元素的html
    append: function(html){
        for(var i = this.baseElement.length - 1;i >= 0;i --){
            this.baseElement[i].innerHTML += html;
        }
    },

    each: function(func){
           for(var i = 0;i < this.baseElement.length;i ++){
              func.call(this.baseElement[i],i);
           }
    },

    attr: function(at,value){

      if(at == "class") at = "className";

      var returnVal = null; 
      this.each(function(){

        if(value == null){
          returnVal = this[at];
          return;
        }

        this.setAttribute(at,value);
      });

      return returnVal;
    },

    //有待完善
    remove: function(){
      this.each(function(){
          try{
            this.parentNode.removeChild(this);
          }catch(e){
          }
      });
    },

    ready: function(func){

        this.each(function(){
            this.body.onload = func;
        });
    },

    parent: function(){//有待检测
        var returnVal = [];

        this.each(function(){
           returnVal.push(this.parentNode); 
        });

        this.baseElement = returnVal;
        return this;
    },

    keydown: function(func){

        this.each(function(){
            this.onkeydown = func;
        });

    },

    css: function(property, el){
        var el = el || this.baseElement[0];
        try{
            var computedStyle = getComputedStyle(el);
            return computedStyle.getPropertyValue(property);
        }catch(e){
            return el.currentStyle[property];
        }
    },

    animate: function(endCss, time, callBack){

      var _this = this;

      this.each(function(){
        ani(this, endCss, time, callBack);
      });

      function ani(el, endCss, time, callBack){
         var FPS = 60;
         var everyStep = {}, currStyle = {};

         for(var i in endCss){
           var currValue = parseInt(_this.css(i, el));
           currStyle[i] = currValue;

           everyStep[i] = parseInt(parseInt(endCss[i]) - currValue) / time;
         }

         //当前frame
         var frame = 0, timer;

         function step(){
           frame ++;

           //当前时间 ms
           var t = frame / FPS * 1000;

           //对时间做缓动变换

           //标准化当前时间
           var t0 = t / time;

           //变换函数
           var f = function(x, p0, p1, p2, p3){

             //二次贝塞尔曲线
             //return Math.pow((1 - x), 2) * p0 + (2 * x) * (1 - x) * p1 + x * x * p2; 

             //基于三次贝塞尔曲线 
             return p0 * Math.pow((1 - x), 3) + 3 * p1 * x * Math.pow((1 - x), 2) + 3 * p2 * x * x * (1 - x) + p3 * Math.pow(x, 3);
           }

           //对时间进行三次贝塞尔变换 输出时间
           var t1 = f(t0, 0, 0.42, 1.0, 1.0) * time;

           for(var i in everyStep){
             if(i == "opacity"){
                if(window.addEventListener){
                     el.style[i] = (currStyle[i] + everyStep[i] * t1);

                //ie < 9
                }else{
                    el.style.filter = "alpha(opacity=" + (currStyle[i] + everyStep[i] * t1) * 100 + ")";
                    function setChild(el){
                        var children = el.childNodes; 
                        for(var j = 0, n = children.length; j < n; j ++){
                            children[j] && children[j].nodeType == 1 && (children[j].style.filter = "alpha(opacity=" + (currStyle[i] + everyStep[i] * t1) * 100 + ")") && setChild(children[j]);
                        }
                    }

                    setChild(el);
                }
             }
             else el.style[i] = (currStyle[i] + everyStep[i] * t1) + "px";
           }

           if(frame == time / 1000 * FPS){
             clearInterval(timer);
             callBack && callBack();
           }
         }

         timer = setInterval(step, 1000 / FPS);
      }
    }

  };
  return main;
}

$.ajax = function(obj){
  //var ajaxXml = new XMLHTTP
}
