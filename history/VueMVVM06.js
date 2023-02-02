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
                // console.log(name);  // v-model
                //把 v-model 分割开，只要后面的model
                let [,directive] = name.split('-');
                // console.log(directive); // model
                //调用不同的指令对应的不同的处理办法
                CompilerUtil[directive]();
            }
        })
    }
    compileText(node){
        let content = node.textContent;
        let reg = /\{\{(.+?)\}\}/;  
        reg.test(content)
        if(reg.test(content)){
            // console.log(content)    //{{school.name}}  {{school.age}}
        }
    }
    compile(node){
        let childNodes = node.childNodes;   
        [...childNodes].forEach(child=>{
            if(this.isElementNode(child)){
                this.compileElement(child);
                this.compile(child)
            }else{
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

//写一个对象，{}，包含了不同的指令对应的不同的处理办法
CompilerUtil = {
    model(){
        console.log('处理v-model指令');
    },
    text(){
        console.log('处理v-text指令');
    },
    html(){
        console.log('处理v-html指令');
    },
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