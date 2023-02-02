//编译模板
class Compiler{
    constructor(el,vm){
        this.el = this.isElementNode(el) ? el:document.querySelector(el)
        console.log(this.el);
    }
    //判断一个节点是否是元素节点
    isElementNode(node){
        return node.nodeType === 1;
    }
}

//html要渲染成一张网页，要形成一颗dom树，在dom树上有两类节点：元素节点，文本节点，而属性节点不在dom树上
//Vue类
class Vue{
    //只要new Vue，那么就会调用这个方法
    constructor(options){
        // 把 el 和 data 挂在 MVVM 实例上
        this.$el = options.el;
        this.$data = options.data;
        // 如果$el存在，那么可以找到上面的Html模块
        if(this.$el){
            // 需要找到模块中需要替换数据的元素，编译模板
            new Compiler(this.$el,this)
        }
    }
}