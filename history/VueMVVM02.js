class Compiler{
    constructor(el,vm){
        this.el = this.isElementNode(el) ? el:document.querySelector(el)
        
        //把模板传给node2fragment，通过这个方法把模板存放到文档碎片中
        let fragment = this.node2fragment(this.el)

        //把替换完的数据重新给网页
        this.el.appendChild(fragment)
    }
    //定义一个方法，用来把模板存放到文档碎片里
    node2fragment(node){
        //创建一个文档碎片，用来存放我们的html模板，注：他们是逐条进行存储的
        let fragment = document.createDocumentFragment()
        //第一个子节点
        let firstChild; 
        // 循环取出根节点中的第一个子节点并放入文档碎片中
        while(firstChild = node.firstChild){    
            fragment.appendChild(firstChild)
        }
        //返回模板
        return fragment;
    }
    isElementNode(node){
        return node.nodeType === 1;
    }
}

class Vue{
    constructor(options){
        this.$el = options.el;
        this.$data = options.data;
        if(this.$el){
            new Compiler(this.$el,this)
        }
    }
}