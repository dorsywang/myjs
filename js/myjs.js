/*
   迫于用户压力，防止其使用for in 遍历数组 略去
   Array.prototype.each = function(func){
  for(var i = 0;i < this.length;i ++){
    func.call(this[i],i);
  }
};
*/
/**测试each
var test = [
  {value:3},{value:4}
];
test.each(function(i){
});
*/
var $ = function(base){
  var Selector = {//--------------------start选择器-----------------------------
    parsePattern : {
              //构造正则检测式
      idParse : new RegExp("^#"),//id
      tagParse : new RegExp("^[^#.]"),//Tag
      classParse : new RegExp("^."),//class
      mutiIdParse : new RegExp("(^[A-Za-z0-9_]+)#"),//div#t
      mutiClassParse : new RegExp("(^[A-Za-z0-9_]+)\\."),
              //eq:(1) 选择器
      eqParse : /:eq\(([0-9]+)\)/
    },
    eqNumber : -1,//记录eq(3) 中的3
    init : function(){//做一些初始化的工作
    },
    resultArr : [],
    getBaseElement : function(b){
      if(this.parsePattern.eqParse.test(b)){
        var parseResult = b.match(this.parsePattern.eqParse);
        this.eqNumber = parseResult[1];
        b= b.replace(this.parsePattern.eqParse,"");
      }
      //分离空格选择器
      b= b.replace(/ +/g," ");
      b= b.split(" ");
      var resultArr = [];

      var lastElement = b[b.length - 1];//最后一个标记
      var lastElementArr = this.getElement(lastElement);//得到最后一个元素数组
      var flag = 0;

      var that = this;
      function checkParent(currentElement,currentNumber){//递归检测父元素,curr...当前元素，curr...对应要检测标记的下标
        if(currentNumber == 0){
          flag = 1;
          return;
        }
        var parentNode = currentElement.parentNode;
        if(!parentNode) return;
        if(!parentNode.tagName) return;
        var parentMark = b[currentNumber - 1];
        if(that.parsePattern.idParse.test(parentMark)){//若此标记是id标记
          if(parentNode.id == parentMark.replace("#","")) checkParent(parentNode,-- currentNumber);
          else{
          checkParent(parentNode,currentNumber);
          }
        }else if(that.parsePattern.tagParse.test(parentMark)){
          if(parentNode.tagName.toLowerCase() == parentMark.toLowerCase()) checkParent(parentNode, -- currentNumber);
          else{
            checkParent(parentNode,currentNumber);
        }
        }else if(that.parsePattern.classParse.test(parentMark)){
          if(parentNode.className == parentMark.replace(".","")) checkParent(parentNode, -- currentNumber);
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
    getElement : function(b){//获得基础元素，id tag class
        var tag = null;
        if(this.parsePattern.mutiIdParse.test(b)){
          tag = this.parsePattern.mutiIdParse.exec(b)[1];
          b = b.replace(this.parsePattern.mutiIdParse,"#");
        }else if(this.parsePattern.mutiClassParse.test(b)){
          tag = this.parsePattern.mutiClassParse.exec(b)[1];
          b = b.replace(this.parsePattern.mutiClassParse,".");
        }
      //返回获取元素，类型为数组    
        if(this.parsePattern.idParse.test(b)){
          var Ele = document.getElementById(b.replace("#",""))
          if(tag){
            if(Ele.tagName.toLowerCase() == tag.toLowerCase()) return [Ele];
          }else return [Ele];
        }
        else if(this.parsePattern.tagParse.test(b)) {
          return document.getElementsByTagName(b);
        }
        else if(this.parsePattern.classParse.test(b)){
          var tempArr = document.getElementsByTagName("*");
          var resultArr = [];
          var classPattern = new RegExp("( )*" + b.replace(".",""));//构造动态的正则检测，检测如多类名情形："a b"
          for(var i in tempArr){
            if(tempArr[i].nodeType == 1){
              if(classPattern.test(tempArr[i].className)){
                if(tag){
                  if(tempArr[i].tagName.toLowerCase() == tag.toLowerCase()) resultArr.push(tempArr[i]);
                }else resultArr.push(tempArr[i]);
              }
            } 
          }
          return resultArr;
        }
      }

    };//----------------------------------End选择器------------------------------- 
  if(base != document){
    base = Selector.getBaseElement(base);
    base = Selector.resultArr;
  }
  else base = [document];
  var main = {//构造主操作对象
    baseElement:base,//baseElement为数组
    html:function(s){//改变元素的html
      if(s == undefined) try{
          return this.baseElement[0].innerHTML;
        }catch(e){
          return undefined;
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
    append:function(html){//增加元素的html
        for(var i = this.baseElement.length - 1;i >= 0;i --){
            this.baseElement[i].innerHTML += html;
        }
    },
    each:function(func){
           for(var i = 0;i < this.baseElement.length;i ++){
              func.call(this.baseElement[i],i);
           }
    },
    attr:function(at,value){
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
    remove: function(){//有待完善
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
    }
  };
  return main;
}
$.ajax = function(obj){
  //var ajaxXml = new XMLHTTP
}
