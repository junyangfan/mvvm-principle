class Compiler{
    constructor(el,vm){
        this.el = this.isElementNode(el) ? el:document.querySelector(el)
        
        let fragment = this.node2fragment(this.el)

        //替换（编译模板）用数据来编译
        this.compile(fragment)

        this.el.appendChild(fragment)
    }
    compile(node){
        // console.log(node)  // [input, div, div, ul]
        // childNodes 并不包含li 仅仅是得到子节点，而不是子子节点
        // console.log(node.childNodes);   //NodeList(9) [text, input, text, div, text, div, text, ul, text]
        // node.childNodes 一堆的节点：包含元素节点和文本节点
        let childNodes = node.childNodes;   //childNodes是一个伪数组
        //把伪数组转换成真实的数组
        [...childNodes].forEach(child=>{
            //判断是元素节点，还是文本节点
            if(this.isElementNode(child)){
                console.log(child+'是一个元素节点');
            }else{
                console.log(child+'是一个文本节点');
            }
        })
    }
    node2fragment(node){
        let fragment = document.createDocumentFragment()
        let firstChild; 
        while(firstChild = node.firstChild){    
            fragment.appendChild(firstChild)
        }
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