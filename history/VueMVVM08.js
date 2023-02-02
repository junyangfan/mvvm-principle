class Compiler{
    constructor(el,vm){
        this.vm = vm
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
            let {name,value:expr} = attr;
            if(this.isDirective(name)){
                let [,directive] = name.split('-');
                CompilerUtil[directive](node,expr,this.vm);
            }
        })
    }
    compileText(node){
        let content = node.textContent;
        let reg = /\{\{(.+?)\}\}/;  
        reg.test(content)
        if(reg.test(content)){
            // console.log(content);   // {{school.name}}  {{school.age}}
            // console.log(node);  //"{{school.name}}"  node是文本节点
            CompilerUtil['text'](node,content,this.vm)
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

CompilerUtil = {
    getVal(vm,expr){
        return expr.split(".").reduce((data,current)=>{
            return data[current]
        },vm.$data);
    },
    model(node,expr,vm){ 
        let value = this.getVal(vm,expr) 
        let fn = this.updater['modelUpdater']
        fn(node,value)
    },
    text(node,expr,vm){
        // console.log('处理v-text指令');
        // console.log(node);  //"{{school.name}}"
        // console.log(expr);  //{{school.name}}
        // console.log(vm);    //vue实例
        //把全局的{{}}全部替换 replace 是替换方法
        let content = expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
            // console.log(args);  //["{{school.age}}", "school.age", 0, "{{school.age}}"]
            //拿到数据
            // console.log(this.getVal(vm,args[1]));   //HuangHuai   10
            return this.getVal(vm,args[1])
        })
        //进行视图更新
        let fn = this.updater['textUpdater']
        fn(node,content)
    },
    html(){
        console.log('处理v-html指令');
    },
    updater:{
        modelUpdater(node,value){
            node.value = value
        },
        textUpdater(node,value){
            // textContent得到文本节点中内容
            node.textContent = value
        },
        htmlUpdater(){}
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