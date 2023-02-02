class Compiler{
    constructor(el,vm){
        this.el = this.isElementNode(el) ? el:document.querySelector(el)
        let fragment = this.node2fragment(this.el)
        this.compile(fragment)
        this.el.appendChild(fragment)
    }
    //判断一个属性是否是一个指令
    isDirective(attrName){
        //只要前面有 v- ，那么就是指令
        return attrName.startsWith('v-')    
    }
    //编译元素节点
    compileElement(node){
        let attributes = node.attributes;    //某个元素的属性节点
        // console.log(attributes);    //伪数组 NamedNodeMap {0: type, 1: v-model, type: type, v-model: v-model, length: 2}
        //把伪数组转成真实的数组
        [...attributes].forEach(attr=>{
            // console.log(attr);   //type="text"  v-model="school.name"
            let {name,value} = attr;
            // console.log(name,value);    //type  text       v-model  school.name
            //判断是否是一个指令
            if(this.isDirective(name)){
                console.log(name+"是一个指令")  //v-model是一个指令
                console.log(node);  //包含这个指令的元素  <input type="text" v-model="school.name">
            }
        })
    }
    //编译文本节点
    compileText(node){

    }
    compile(node){
        let childNodes = node.childNodes;   //childNodes是一个伪数组
        [...childNodes].forEach(child=>{
            if(this.isElementNode(child)){
                //元素节点，调用上面的编译元素节点的方法
                this.compileElement(child);
            }else{
                //文本节点，调用上面的编译文本节点的方法
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