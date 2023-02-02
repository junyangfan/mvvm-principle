class Compiler{
    constructor(el,vm){
        this.el = this.isElementNode(el) ? el:document.querySelector(el)
        let fragment = this.node2fragment(this.el)
        this.compile(fragment)
        this.el.appendChild(fragment)
    }
    isDirective(attrName){
        return attrName.startsWith('v-')    
    }
    compileElement(node){
        let attributes = node.attributes;  
        [...attributes].forEach(attr=>{
            let {name,value} = attr;
            if(this.isDirective(name)){
                //现在就可以找到模板中带有指令的元素节点了
                console.log(name);  
            }
        })
    }
    //编译文本节点
    compileText(node){
        // console.log(node);  //得到所有的文本节点
        let content = node.textContent;
        // console.log(content);   //得到所有的文本节点中的内容
        let reg = /\{\{(.+?)\}\}/;  //得到插值表达式，也就是 {{ }}
        reg.test(content)   //// 如果content满足我们写的正则，返回ture，否则返回false
        if(reg.test(content)){
            //找到文本节点
            console.log(content)    //{{school.name}}  {{school.age}}
        }
    }
    compile(node){
        let childNodes = node.childNodes;   
        [...childNodes].forEach(child=>{
            // child就表示每一个节点
            // 如果child元素节点，调用 compileElement
            if(this.isElementNode(child)){
                this.compileElement(child);
                // 可以一个元素节点中嵌套其它的元素点，还可能嵌套文本节点
                // 如果child内部还有其它节点，需要利用递归重新编译
                this.compile(child)
            }else{
                // 否则调用compileText
                this.compileText(child)
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