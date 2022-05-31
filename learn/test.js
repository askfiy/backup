// ABCDEF

var name = "Alex";

function Foo() {
  this.name = "武沛齐";
  this.func = function () {
    (function () {
      console.log(this.name);
    })();
  };
}

var obj = new Foo();
obj.func();
